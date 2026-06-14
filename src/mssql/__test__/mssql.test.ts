import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("safeQuery", () => {
  let safeQuery: typeof import("../mssql.js").safeQuery;

  beforeEach(async () => {
    ({ safeQuery } = await import("../mssql.js"));
  });

  it("allows queries with matching prefixes", () => {
    const res = safeQuery("SELECT id FROM users", ["SELECT", "VALUES"]);
    expect(res).toBe("SELECT id FROM users");
  });

  it("rejects queries with non-matching prefixes", () => {
    expect(() => safeQuery("INSERT INTO users", ["SELECT"])).toThrow(/SQL query is not allowed/);
  });

  it("allows a trailing semicolon on a single query", () => {
    const res = safeQuery("SELECT 1;", ["SELECT"]);
    expect(res).toBe("SELECT 1");
  });

  it("allows semicolons inside string literals", () => {
    const res = safeQuery("SELECT * FROM users WHERE email = 'a;b';", ["SELECT"]);
    expect(res).toBe("SELECT * FROM users WHERE email = 'a;b'");
  });

  it("rejects multiple queries separated by semicolons", () => {
    expect(() => safeQuery("SELECT 1; SELECT 2", ["SELECT"])).toThrow(
      /Only a single SQL query is allowed/
    );
  });

  it("throws an error if the query is empty", () => {
    expect(() => safeQuery("  ", ["SELECT"])).toThrow(/SQL query cannot be empty/);
  });

  it("allows a single-line comment at the start of the query", () => {
    const res = safeQuery("-- komentar ini\nSELECT 1", ["SELECT"]);
    expect(res).toBe("-- komentar ini\nSELECT 1");
  });

  it("allows a block comment at the start of the query", () => {
    const res = safeQuery("/* komentar blok */ SELECT 1", ["SELECT"]);
    expect(res).toBe("/* komentar blok */ SELECT 1");
  });

  it("allows double single quotes inside string literals", () => {
    const res = safeQuery("SELECT 'it''s fine'", ["SELECT"]);
    expect(res).toBe("SELECT 'it''s fine'");
  });

  it("allows backslash escape inside string literals", () => {
    const res = safeQuery("SELECT 'Achmad\\'s book'", ["SELECT"]);
    expect(res).toBe("SELECT 'Achmad\\'s book'");
  });

  it("allows MSSQL bracket identifiers", () => {
    const res = safeQuery("SELECT [column;name] FROM users", ["SELECT"]);
    expect(res).toBe("SELECT [column;name] FROM users");
  });

  it("rejects queries with unterminated single quotes", () => {
    expect(() => safeQuery("SELECT 'hello", ["SELECT"])).toThrow(
      /Unterminated single quote string/
    );
  });

  it("rejects queries with unterminated block comments", () => {
    expect(() => safeQuery("/* komentar SELECT 1", ["SELECT"])).toThrow(
      /Unterminated block comment/
    );
  });

  it("rejects dangerous SQL patterns like XP_CMDSHELL or LOAD_FILE", () => {
    expect(() => safeQuery("SELECT LOAD_FILE('/etc/passwd')", ["SELECT"])).toThrow(
      /Dangerous SQL pattern detected/
    );
    expect(() => safeQuery("EXEC xp_cmdshell 'dir'", ["EXEC", "SELECT"])).toThrow(
      /Dangerous SQL pattern detected/
    );
  });
});

describe("runSql", () => {
  const mockConnect = jest.fn<() => Promise<void>>();
  const mockQuery = jest.fn<() => Promise<unknown>>();
  const mockClose = jest.fn<() => Promise<void>>();
  const mockRequest = jest.fn(() => ({
    query: mockQuery,
  }));
  const mockConnectionPool = jest.fn(() => ({
    connect: mockConnect,
    request: mockRequest,
    close: mockClose,
  }));

  beforeEach(async () => {
    jest.resetModules();
    mockConnect.mockReset();
    mockQuery.mockReset();
    mockClose.mockReset();
    mockRequest.mockReset();
    mockConnectionPool.mockReset();

    mockConnect.mockResolvedValue(undefined);
    mockClose.mockResolvedValue(undefined);
    mockRequest.mockReturnValue({
      query: mockQuery,
    });
    mockConnectionPool.mockImplementation(() => ({
      connect: mockConnect,
      request: mockRequest,
      close: mockClose,
    }));

    await jest.unstable_mockModule("mssql", () => ({
      default: { ConnectionPool: mockConnectionPool },
    }));

    await jest.unstable_mockModule("../config.js", () => ({
      default: {
        host: "127.0.0.1",
        port: 1433,
        user: "",
        password: "",
        database: undefined,
        connectionTimeoutMs: 15000,
        requestTimeoutMs: 15000,
        encrypt: true,
        trustServerCertificate: true,
        instanceName: undefined,
        maxRows: 2,
        allowInsert: false,
        allowUpdate: false,
        allowDelete: false,
        allowDdl: false,
      },
    }));
  });

  it("returns a result set and truncates rows according to maxRows", async () => {
    const recordset: any = [{ id: 1 }, { id: 2 }, { id: 3 }];
    recordset.columns = { id: {} };

    mockQuery.mockResolvedValue({
      recordset,
    });

    const { runSql } = await import("../mssql.js");
    const result = await runSql("SELECT id FROM users");

    expect(result).toEqual({
      kind: "resultset",
      columns: ["id"],
      rowCount: 2,
      totalRows: 3,
      truncated: true,
      maxRows: 2,
      rows: [{ id: 1 }, { id: 2 }],
    });
    expect(mockClose).toHaveBeenCalled();
  });

  it("returns an execute result for DML without a result set", async () => {
    mockQuery.mockResolvedValue({
      recordset: undefined,
      rowsAffected: [1],
    });

    const { runSql } = await import("../mssql.js");
    const result = await runSql("UPDATE users SET active = 1");

    expect(result).toEqual({
      kind: "execute",
      affectedRows: 1,
    });
  });

  it("throws a ToolError when connection fails", async () => {
    mockConnect.mockRejectedValue(new Error("ECONNREFUSED"));

    const { runSql } = await import("../mssql.js");
    await expect(runSql("SELECT 1")).rejects.toThrow(/MSSQL: ECONNREFUSED/);
  });
});
