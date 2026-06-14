import { envBool, envInt, envStr } from "@achmadya-dev/mcp-core";

export default {
  host: envStr("MSSQL_HOST", "localhost"),
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
