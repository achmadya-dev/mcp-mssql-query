import { defineTool, ToolError } from "@achmadya-dev/mcp-core";
import { z } from "zod";
import { runSql, safeQuery } from "../mssql/mssql.js";
import {
  mssqlQueryInputSchema,
  mssqlQueryOutputShape,
  mssqlQueryResultSchema,
} from "../mssql/schema.js";

export const mssql_select = defineTool({
  name: "mssql_select",
  description:
    "Read data from the database using SELECT, VALUES, or PRINT. Only a single query is allowed.",
  inputSchema: mssqlQueryInputSchema,
  outputSchema: mssqlQueryOutputShape,
  handler: async ({ sql }) => {
    const query = safeQuery(sql, ["SELECT", "VALUES", "PRINT"]);
    const result = await runSql(query);
    const parsed = mssqlQueryResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new ToolError(`Invalid query result: ${parsed.error.message}`);
    }
    return parsed.data;
  },
});
