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
import config from "./mcp/mssql/config.js";

async function main(): Promise<void> {
  const server = new Server({
    name: "MSSQL Database",
    version: packageJson.version,
  });

  server.registerTool(mssql_select);
  if (config.allowInsert) server.registerTool(mssql_insert);
  if (config.allowUpdate) server.registerTool(mssql_update);
  if (config.allowDelete) server.registerTool(mssql_delete);
  if (config.allowDdl) server.registerTool(mssql_ddl);

  await server.start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
