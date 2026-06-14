import { defineTool, ToolError } from "@achmadya-dev/mcp-core";
import { z } from "zod";
import { runSql, safeQuery } from "../mssql/mssql.js";
import {
  mssqlQueryInputSchema,
  mssqlQueryOutputShape,
  mssqlQueryResultSchema,
} from "../mssql/schema.js";
import config from "../mssql/config.js";

export const mssql_insert = defineTool({
  name: "mssql_insert",
  description:
    "Insert new data into the database using INSERT. Only a single query is allowed. If the operation is rejected as not allowed, you must respect this safety restriction and do not attempt to bypass it via terminal commands, custom scripts, or external tools.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    if (!config.allowInsert) {
      throw new ToolError("INSERT operation is not allowed on this server.");
    }
    const query = safeQuery(sql, ["INSERT"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    }
    return parsed.data;
  },
});
