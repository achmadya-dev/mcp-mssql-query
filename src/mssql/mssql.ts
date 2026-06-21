import mssql from "mssql";
import type { config as MssqlClientConfig } from "mssql";
import { ToolError } from "@achmadya-dev/mcp-core";
import config from "./config.js";
import { formatConnectionError } from "../connection-status.js";
import * as helpers from "./helpers.js";

export function safeQuery(sql: string, allowedPrefixes: string[]): string {
  const { cleanSql, prefixes } = helpers.validateInputs(sql, allowedPrefixes);
  const statement = helpers.parseSingleStatement(cleanSql);
  helpers.validateStatement(statement, prefixes);
  return statement;
}

function connectionConfig(): MssqlClientConfig {
  return {
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
}

export async function checkConnection(): Promise<void> {
  const pool = new mssql.ConnectionPool(connectionConfig());

  try {
    await pool.connect();
    await pool.request().query("SELECT 1");
  } catch (e) {
    throw new Error(formatConnectionError("MSSQL", e));
  } finally {
    await pool.close();
  }
}

export async function runSql(sql: string): Promise<
  | {
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
    }
> {
  const clientConfig: MssqlClientConfig = connectionConfig();

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

    const affected = (result.rowsAffected ?? []).reduce((acc, n) => acc + (n ?? 0), 0);

    return {
      kind: "execute",
      affectedRows: affected,
    };
  } catch (e) {
    throw new ToolError(`MSSQL: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    await pool.close();
  }
}
