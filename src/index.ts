#!/usr/bin/env node
import { Server } from "./mcp/server.js";
import packageJson from "../package.json" with { type: "json" };
import {
  mssql_select,
  mssql_insert,
  mssql_update,
  mssql_delete,
  mssql_ddl,
} from "./mcp/registry.js";

async function main(): Promise<void> {
  const server = new Server({
    name: "MSSQL Database",
    version: packageJson.version,
  });

  server.registerTool(mssql_select);
  server.registerTool(mssql_insert);
  server.registerTool(mssql_update);
  server.registerTool(mssql_delete);
  server.registerTool(mssql_ddl);

  await server.start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
