# @achmadya-dev/mcp-mssql-query

## 0.3.2

### Patch Changes

- 81c615f: Bump `@achmadya-dev/mcp-core` to ^0.8.0.

## 0.3.1

### Patch Changes

- 74022a7: Register a connection_status tool when startup health check fails, with clearer driver error messages.

## 0.3.0

### Minor Changes

- ed34946: Check SQL Server connection at startup and disable tools when the database is unreachable.

## 0.2.2

### Patch Changes

- 8a2978d: Bump @achmadya-dev/mcp-core to ^0.6.0 for tool result helpers and simplified registration API.

## 0.2.1

### Patch Changes

- Migrate to mcp-core 0.5.0: replace `startMcpServer` with `runMcp`.

## 0.2.0

### Minor Changes

- 41291c5: Sync standalone repo with monorepo: mcp-core 0.3.x, Zod schemas, Changesets CI/publish.
