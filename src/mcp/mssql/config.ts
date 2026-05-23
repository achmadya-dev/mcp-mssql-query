function envBool(name: string, defaultVal = false): boolean {
  const v = Reflect.get(process.env, name);
  if (v === undefined) return defaultVal;
  return ["1", "true", "yes", "on"].includes(v.trim().toLowerCase());
}

function envInt(name: string, defaultVal: number, min = 1): number {
  const raw = Reflect.get(process.env, name);
  if (raw === undefined) return defaultVal;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) || n < min ? defaultVal : n;
}

function envStr(name: string, defaultVal = ""): string {
  const raw = Reflect.get(process.env, name);
  if (raw === undefined) return defaultVal;
  const v = raw.trim();
  return v || defaultVal;
}

export default {
  host: envStr("MSSQL_HOST", "127.0.0.1"),
  port: envInt("MSSQL_PORT", 1433),
  user: envStr("MSSQL_USER"),
  password: envStr("MSSQL_PASSWORD", ""),
  database: envStr("MSSQL_DATABASE") || undefined,
  instanceName: envStr("MSSQL_INSTANCE_NAME") || undefined,
  encrypt: envBool("MSSQL_ENCRYPT", true),
  trustServerCertificate: envBool("MSSQL_TRUST_SERVER_CERTIFICATE", true),
  connectionTimeoutMs: envInt("MSSQL_CONNECTION_TIMEOUT_MS", 15000),
  requestTimeoutMs: envInt("MSSQL_REQUEST_TIMEOUT_MS", 15000),
  maxRows: envInt("MSSQL_MAX_ROWS", 500),
  allowInsert: envBool("ALLOW_INSERT_OPERATION"),
  allowUpdate: envBool("ALLOW_UPDATE_OPERATION"),
  allowDelete: envBool("ALLOW_DELETE_OPERATION"),
  allowDdl: envBool("ALLOW_DDL_OPERATION"),
};
