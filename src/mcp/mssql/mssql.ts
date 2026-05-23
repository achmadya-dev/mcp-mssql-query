import mssql from "mssql";
import type { config as MssqlClientConfig } from "mssql";
import { ToolError } from "../server.js";
import config from "./config.js";

export function safeQuery(sql: string, allowedPrefixes: string[]): string {
  const clean = sql.trim();
  if (!clean) throw new ToolError("Kueri SQL tidak boleh kosong.");

  const upper = clean.toUpperCase();
  const hasPrefix = allowedPrefixes.some(prefix => {
    if (!upper.startsWith(prefix)) return false;
    if (upper.length === prefix.length) return true;
    const nextChar = upper.charAt(prefix.length);
    return /\s/.test(nextChar);
  });
  if (!hasPrefix) {
    throw new ToolError(`Kueri SQL tidak diizinkan untuk perkakas ini. Harus dimulai dengan salah satu dari: ${allowedPrefixes.join(", ")}`);
  }

  const parts: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let escape = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean.charAt(i);
    if (escape) {
      current += char;
      escape = false;
      continue;
    }

    if (char === "\\") {
      current += char;
      escape = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote && !inBacktick) inSingleQuote = !inSingleQuote;
    if (char === '"' && !inSingleQuote && !inBacktick) inDoubleQuote = !inDoubleQuote;
    if (char === "`" && !inSingleQuote && !inDoubleQuote) inBacktick = !inBacktick;

    if (char === ";" && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.length > 0) parts.push(current);

  const nonEmptyParts = parts.map(p => p.trim()).filter(p => p.length > 0);
  if (nonEmptyParts.length > 1) {
    throw new ToolError("Hanya satu kueri SQL yang diperbolehkan per panggilan (tidak boleh ada beberapa kueri dipisahkan dengan ';').");
  }

  return clean;
}

export async function runSql(sql: string): Promise<{
  kind: "resultset";
  columns: string[];
  rowCount: number;
  totalRows: number;
  truncated: boolean;
  maxRows: number;
  rows: Record<string, any>[];
}
| {
  kind: "execute";
  affectedRows: number;
}> {
  const clientConfig: MssqlClientConfig = {
    server: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionTimeout: config.connectionTimeoutMs,
    requestTimeout: config.requestTimeoutMs,
    options: {
      encrypt: config.encrypt,
      trustServerCertificate: config.trustServerCertificate,
      instanceName: config.instanceName,
    },
    pool: { min: 0, max: 1 },
  };

  const pool = new mssql.ConnectionPool(clientConfig);

  try {
    await pool.connect();
    const result = await pool.request().query(sql);

    const rs = result.recordset;
    const hasRecordset = !!rs && !!rs.columns && Object.keys(rs.columns).length > 0;

    if (hasRecordset) {
      const columns = Object.keys(rs.columns);
      const all = Array.from(rs) as Record<string, any>[];
      const truncated = all.length > config.maxRows;
      const display = all.slice(0, config.maxRows);

      return {
        kind: "resultset",
        columns,
        rowCount: display.length,
        totalRows: all.length,
        truncated,
        maxRows: config.maxRows,
        rows: display,
      };
    }

    const affected = (result.rowsAffected ?? []).reduce(
      (acc, n) => acc + (n ?? 0),
      0
    );

    return {
      kind: "execute",
      affectedRows: affected,
    };
  } catch (e) {
    throw new ToolError(
      `MSSQL: ${e instanceof Error ? e.message : String(e)}`
    );
  } finally {
    await pool.close();
  }
}
