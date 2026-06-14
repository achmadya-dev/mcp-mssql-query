# @achmadya-dev/mcp-mssql-query

MCP server for Microsoft SQL Server. Runs a single T-SQL statement per tool call over **stdio**. **Read-only by default** — writes and DDL require explicit env flags.

## Requirements

- Node.js **≥ 20**
- A reachable SQL Server instance

## Install from npm

```json
{
  "mcpServers": {
    "mssql": {
      "command": "npx",
      "args": ["-y", "@achmadya-dev/mcp-mssql-query"],
      "env": {
        "MSSQL_HOST": "localhost",
        "MSSQL_PORT": "1433",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "your_password",
        "MSSQL_DATABASE": "your_database",
        "MSSQL_TRUST_SERVER_CERTIFICATE": "true"
      }
    }
  }
}
```

Or use `envFile` instead of inline `env`.

## Develop from source

```bash
git clone https://github.com/achmadya-dev/mcp-mssql-query.git
cd mcp-mssql-query
pnpm install
pnpm run build
pnpm test
```

Open the repo root in Cursor. You need a reachable SQL Server instance — set connection env in `.cursor/mcp.json` or via `envFile`:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"],
      "env": {
        "MSSQL_HOST": "localhost",
        "MSSQL_PORT": "1433",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "your_password",
        "MSSQL_DATABASE": "your_database",
        "MSSQL_TRUST_SERVER_CERTIFICATE": "true"
      }
    }
  }
}
```

## Environment variables

### Connection

| Variable                         | Default      | Description                          |
| -------------------------------- | ------------ | ------------------------------------ |
| `MSSQL_HOST`                     | `localhost`  | SQL Server host                      |
| `MSSQL_PORT`                     | `1433`       | Port                                 |
| `MSSQL_USER`                     | _(empty)_    | Username                             |
| `MSSQL_PASSWORD`                 | _(empty)_    | Password                             |
| `MSSQL_DATABASE`                 | _(optional)_ | Database name                        |
| `MSSQL_INSTANCE_NAME`            | _(optional)_ | Instance name (e.g. `SQLEXPRESS`)    |
| `MSSQL_ENCRYPT`                  | `true`       | Encrypt connection                   |
| `MSSQL_TRUST_SERVER_CERTIFICATE` | `true`       | Trust server certificate (local dev) |
| `MSSQL_CONNECTION_TIMEOUT_MS`    | `15000`      | Connection timeout (ms)              |
| `MSSQL_REQUEST_TIMEOUT_MS`       | `15000`      | Request timeout (ms)                 |
| `MSSQL_MAX_ROWS`                 | `500`        | Max rows for row-returning queries   |

### Write access

| Variable                 | Allows   |
| ------------------------ | -------- |
| `ALLOW_INSERT_OPERATION` | `INSERT` |
| `ALLOW_UPDATE_OPERATION` | `UPDATE` |
| `ALLOW_DELETE_OPERATION` | `DELETE` |
| `ALLOW_DDL_OPERATION`    | DDL      |

Enabled values: `true`, `1`, `yes`, `on`.

## Tools

| Tool           | Statements                  | Env flag                 |
| -------------- | --------------------------- | ------------------------ |
| `mssql_select` | `SELECT`, `VALUES`, `PRINT` | always on                |
| `mssql_insert` | `INSERT`                    | `ALLOW_INSERT_OPERATION` |
| `mssql_update` | `UPDATE`                    | `ALLOW_UPDATE_OPERATION` |
| `mssql_delete` | `DELETE`                    | `ALLOW_DELETE_OPERATION` |
| `mssql_ddl`    | DDL                         | `ALLOW_DDL_OPERATION`    |

Each tool accepts one `sql` string.

## Behavior and security

- One T-SQL statement per request.
- Results are JSON text; row-returning queries include truncation metadata.
- Non-row commands return `kind: "execute"` with `affectedRows`.

## Package scripts

```bash
pnpm run build
pnpm test
pnpm start
```
