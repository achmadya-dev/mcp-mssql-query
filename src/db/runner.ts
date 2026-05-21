import type { IRecordSet, IResult } from "mssql";
import type { MssqlConfig } from "../types.js";
import { createPool } from "./connection.js";

export interface ResultSetPayload {
  kind: "resultset";
  columns: string[];
  rowCount: number;
  totalRows: number;
  truncated: boolean;
  maxRows: number;
  rows: Record<string, unknown>[];
}

export interface ExecutePayload {
  kind: "execute";
  affectedRows: number;
}

export type QueryPayload = ResultSetPayload | ExecutePayload;

function hasRecordset(
  result: IResult<unknown>
): result is IResult<unknown> & {
  recordset: IRecordSet<Record<string, unknown>>;
} {
  const rs = result.recordset as
    | IRecordSet<Record<string, unknown>>
    | undefined;
  return !!rs && !!rs.columns && Object.keys(rs.columns).length > 0;
}

function buildResultSetPayload(
  recordset: IRecordSet<Record<string, unknown>>,
  maxRows: number
): ResultSetPayload {
  const columns = Object.keys(recordset.columns);
  const data = Array.from(recordset);
  const truncated = data.length > maxRows;
  const display = data.slice(0, maxRows);
  return {
    kind: "resultset",
    columns,
    rowCount: display.length,
    totalRows: data.length,
    truncated,
    maxRows,
    rows: display,
  };
}

function buildExecutePayload(result: IResult<unknown>): ExecutePayload {
  const affected = (result.rowsAffected ?? []).reduce(
    (acc, n) => acc + (n ?? 0),
    0
  );
  return {
    kind: "execute",
    affectedRows: affected,
  };
}

export async function runSql(
  config: MssqlConfig,
  query: string
): Promise<QueryPayload> {
  const pool = await createPool(config);
  try {
    const result = await pool.request().query(query);
    if (hasRecordset(result)) {
      return buildResultSetPayload(result.recordset, config.maxRows);
    }
    return buildExecutePayload(result);
  } finally {
    await pool.close();
  }
}
