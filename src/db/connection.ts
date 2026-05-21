import mssql from "mssql";
import type {
  ConnectionPool,
  config as MssqlClientConfig,
} from "mssql";
import type { MssqlConfig } from "../types.js";

export async function createPool(
  config: MssqlConfig
): Promise<ConnectionPool> {
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
  await pool.connect();
  return pool;
}
