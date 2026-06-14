import { defineTool, ToolError } from "@achmadya-dev/mcp-core";
import { z } from "zod";
import { runSql, safeQuery } from "../mssql/mssql.js";
import {
  mssqlQueryInputSchema,
  mssqlQueryOutputShape,
  mssqlQueryResultSchema,
} from "../mssql/schema.js";
import config from "../mssql/config.js";

export const mssql_ddl = defineTool({
  name: "mssql_ddl",
  description:
    "Modify the database schema or permissions using CREATE, ALTER, DROP, TRUNCATE, RENAME, GRANT, REVOKE, or DENY. Only a single query is allowed. If the operation is rejected as not allowed, you must respect this safety restriction and do not attempt to bypass it via terminal commands, custom scripts, or external tools.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    if (!config.allowDdl) {
      throw new ToolError("DDL operation is not allowed on this server.");
    }
    const query = safeQuery(sql, [
      "CREATE",
      "ALTER",
      "DROP",
      "TRUNCATE",
      "RENAME",
      "GRANT",
      "REVOKE",
      "DENY",
    ]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    }
    return parsed.data;
  },
});
