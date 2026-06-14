#!/usr/bin/env node
import { startMcpServer } from "@achmadya-dev/mcp-core";
import packageJson from "../package.json" with { type: "json" };
import { mssql_ddl } from "./tools/mssql_ddl.js";
import { mssql_delete } from "./tools/mssql_delete.js";
import { mssql_insert } from "./tools/mssql_insert.js";
import { mssql_select } from "./tools/mssql_select.js";
import { mssql_update } from "./tools/mssql_update.js";

await startMcpServer({
  name: "Microsoft SQL Server",
  version: packageJson.version,
  tools: [mssql_select, mssql_insert, mssql_update, mssql_delete, mssql_ddl],
});
