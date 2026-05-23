import { defineTool, ToolError } from "./server.js";
import { runSql, safeQuery } from "./mssql/mssql.js";
import {
  mssqlQueryInputSchema,
  mssqlQueryOutputShape,
  mssqlQueryResultSchema,
} from "./mssql/schema.js";

export const mssql_select = defineTool({
  name: "mssql_select",
  description: "Membaca data dari database menggunakan SELECT, VALUES, atau PRINT. Hanya diizinkan satu kueri saja.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["SELECT", "VALUES", "PRINT"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mssql_insert = defineTool({
  name: "mssql_insert",
  description: "Memasukkan data baru ke database menggunakan INSERT. Hanya diizinkan satu kueri saja.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["INSERT"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mssql_update = defineTool({
  name: "mssql_update",
  description: "Mengubah data yang ada di database menggunakan UPDATE. Hanya diizinkan satu kueri saja.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["UPDATE"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mssql_delete = defineTool({
  name: "mssql_delete",
  description: "Menghapus data dari database menggunakan DELETE. Hanya diizinkan satu kueri saja.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["DELETE"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});

export const mssql_ddl = defineTool({
  name: "mssql_ddl",
  description: "Mengubah skema database atau hak akses menggunakan CREATE, ALTER, DROP, TRUNCATE, RENAME, GRANT, REVOKE, atau DENY. Hanya diizinkan satu kueri saja.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["CREATE", "ALTER", "DROP", "TRUNCATE", "RENAME", "GRANT", "REVOKE", "DENY"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) throw new ToolError(`Hasil kueri tidak valid: ${parsed.error.message}`);
    return parsed.data;
  },
});
