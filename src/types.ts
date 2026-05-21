export interface MssqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string | undefined;
  instanceName: string | undefined;
  encrypt: boolean;
  trustServerCertificate: boolean;
  connectionTimeoutMs: number;
  requestTimeoutMs: number;
  maxRows: number;
  allowInsert: boolean;
  allowUpdate: boolean;
  allowDelete: boolean;
  allowDdl: boolean;
}

export type StatementKind =
  | "read"
  | "insert"
  | "update"
  | "delete"
  | "ddl"
  | "other";

export interface PolicyResult {
  ok: boolean;
  reason: string;
}

export interface AllowFlags {
  allowInsert: boolean;
  allowUpdate: boolean;
  allowDelete: boolean;
  allowDdl: boolean;
}
