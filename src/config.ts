import type { MssqlConfig } from "./types.js";

function envBool(name: string, defaultVal = false): boolean {
  const v = process.env[name];
  if (v === undefined) return defaultVal;
  return ["1", "true", "yes", "on"].includes(v.trim().toLowerCase());
}

function envInt(name: string, defaultVal: number, min = 1): number {
  const raw = process.env[name];
  if (raw === undefined) return defaultVal;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < min) return defaultVal;
  return parsed;
}

function envStr(name: string, defaultVal: string): string {
  return process.env[name] ?? defaultVal;
}

function envOptionalStr(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : undefined;
}

let cached: MssqlConfig | null = null;

export function loadConfig(): MssqlConfig {
  if (cached) return cached;
  cached = {
    host: envStr("MSSQL_HOST", "127.0.0.1"),
    port: envInt("MSSQL_PORT", 1433),
    user: envStr("MSSQL_USER", "sa"),
    password: envStr("MSSQL_PASSWORD", ""),
    database: envOptionalStr("MSSQL_DATABASE"),
    instanceName: envOptionalStr("MSSQL_INSTANCE_NAME"),
    encrypt: envBool("MSSQL_ENCRYPT", true),
    trustServerCertificate: envBool("MSSQL_TRUST_SERVER_CERTIFICATE", true),
    connectionTimeoutMs: envInt("MSSQL_CONNECTION_TIMEOUT_MS", 15000),
    requestTimeoutMs: envInt("MSSQL_REQUEST_TIMEOUT_MS", 15000),
    maxRows: envInt("MSSQL_MAX_ROWS", 500),
    allowInsert: envBool("ALLOW_INSERT_OPERATION", false),
    allowUpdate: envBool("ALLOW_UPDATE_OPERATION", false),
    allowDelete: envBool("ALLOW_DELETE_OPERATION", false),
    allowDdl: envBool("ALLOW_DDL_OPERATION", false),
  };
  return cached;
}
