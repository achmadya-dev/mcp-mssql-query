# mcp-mssql-typescript

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for Microsoft SQL Server. The `mssql_query` tool lets MCP clients (e.g. Cursor) run **one** T-SQL statement per invocation.

**Default mode: read-only.** Commands such as `INSERT`, `UPDATE`, `DELETE`, and DDL are not executed unless you enable the corresponding environment variables (see below).

## Requirements

- Node.js **≥ 20**

Communication uses **stdio** (not HTTP). SQL Server credentials and options are set via environment variables in your MCP configuration (`env`) or on the system.

## Install in Cursor

1. Open **Settings → MCP**, or edit the `mcp.json` file for your Cursor account.
2. Add a server entry like the example below. The `npx -y` command fetches the package from the npm registry and runs it (no global install required).

```json
{
  "mcpServers": {
    "mssql": {
      "command": "npx",
      "args": ["-y", "@achmadya-dev/mcp-mssql-typescript"],
      "env": {
        "MSSQL_HOST": "127.0.0.1",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "password"
      }
    }
  }
}
```

Adjust the `env` values to match your SQL Server instance.

## Manual setup from a cloned repository

Clone the repository, install dependencies, then build:

```bash
git clone <repo-url> mcp-mssql-typescript
cd mcp-mssql-typescript
pnpm install && pnpm run build
```

Then register the MCP server with **`node`** and the **absolute path** to `dist/index.js` in your project folder:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["C:/Users/Username/projects/mcp-mssql-typescript/dist/index.js"],
      "env": {
        "MSSQL_HOST": "127.0.0.1",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "password"
      }
    }
  }
}
```

Replace the path in `args` with your clone location. After changing TypeScript sources, run `pnpm run build` again.

## Environment variables

### Connection

| Variable                         | Default                  | Description                              |
| -------------------------------- | ------------------------ | ---------------------------------------- |
| `MSSQL_HOST`                     | `127.0.0.1`              | SQL Server host                          |
| `MSSQL_PORT`                     | `1433`                   | Port                                     |
| `MSSQL_USER`                     | `sa`                     | Username                                 |
| `MSSQL_PASSWORD`                 | _(unset = empty string)_ | Password                                 |
| `MSSQL_DATABASE`                 | _(optional)_             | Database selected after connect          |
| `MSSQL_INSTANCE_NAME`            | _(optional)_             | Instance name (e.g. `SQLEXPRESS`)        |
| `MSSQL_ENCRYPT`                  | `true`                   | Encrypt connection                       |
| `MSSQL_TRUST_SERVER_CERTIFICATE` | `true`                   | Trust server certificate (useful for local dev) |
| `MSSQL_CONNECTION_TIMEOUT_MS`    | `15000`                  | Connection timeout (ms)                  |
| `MSSQL_REQUEST_TIMEOUT_MS`       | `15000`                  | Request timeout (ms)                     |
| `MSSQL_MAX_ROWS`                 | `500`                    | Max rows returned for `SELECT` results   |

### Allowing write operations

**Read** commands (`SELECT`, `VALUES`, `PRINT`, and similar) are always allowed.

To allow **writes** or **DDL**, enable the desired types with the variables below. Values treated as enabled: `true`, `1`, `yes`, or `on` (case-insensitive).

| Variable                 | Allows                             |
| ------------------------ | ---------------------------------- |
| `ALLOW_INSERT_OPERATION` | `INSERT`                           |
| `ALLOW_UPDATE_OPERATION` | `UPDATE`                           |
| `ALLOW_DELETE_OPERATION` | `DELETE`                           |
| `ALLOW_DDL_OPERATION`    | DDL (`CREATE`, `ALTER`, `DROP`, etc.) |

If a variable is unset, or its value is not one of the above, that operation type remains **rejected** (read-only for that type).

## Other behavior

- Each request must contain **one** T-SQL statement only (no multiple statements separated by `;`).
- `SELECT` results are returned as **JSON**; row count is capped by `MSSQL_MAX_ROWS`.
- The following constructs are **always rejected**, regardless of `ALLOW_*` settings:
  - Common Table Expression (`WITH ...`)
  - `ROW_NUMBER()`
  - `EXEC` / `EXECUTE`
  - `MERGE INTO`
