import { defineTool, ToolError } from "./server.js";
import { runSql, safeQuery } from "./mssql/mssql.js";
import {
  mssqlQueryInputSchema,
  mssqlQueryOutputShape,
  mssqlQueryResultSchema,
} from "./mssql/schema.js";

export const mssql_select = defineTool({
  name: "mssql_select",
  description: "Read data from the database using SELECT, VALUES, or PRINT. Only a single query is allowed.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["SELECT", "VALUES", "PRINT"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mssql_insert = defineTool({
  name: "mssql_insert",
  description: "Insert new data into the database using INSERT. Only a single query is allowed.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["INSERT"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mssql_update = defineTool({
  name: "mssql_update",
  description: "Update existing data in the database using UPDATE. Only a single query is allowed.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["UPDATE"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mssql_delete = defineTool({
  name: "mssql_delete",
  description: "Delete data from the database using DELETE. Only a single query is allowed.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["DELETE"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mssql_ddl = defineTool({
  name: "mssql_ddl",
  description: "Modify the database schema or permissions using CREATE, ALTER, DROP, TRUNCATE, RENAME, GRANT, REVOKE, or DENY. Only a single query is allowed.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["CREATE", "ALTER", "DROP", "TRUNCATE", "RENAME", "GRANT", "REVOKE", "DENY"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    return parsed.data;
  },
});
