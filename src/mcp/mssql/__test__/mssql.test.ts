import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("safeQuery", () => {
  let safeQuery: typeof import("../mssql.js").safeQuery;

  beforeEach(async () => {
    ({ safeQuery } = await import("../mssql.js"));
  });

  it("mengizinkan kueri dengan prefiks yang cocok", () => {
    const res = safeQuery("SELECT id FROM users", ["SELECT", "VALUES"]);
    expect(res).toBe("SELECT id FROM users");
  });

  it("menolak kueri dengan prefiks yang tidak cocok", () => {
    expect(() => safeQuery("INSERT INTO users", ["SELECT"])).toThrow(
      /SQL query is not allowed/
    );
  });

  it("mengizinkan titik koma di akhir kueri tunggal", () => {
    const res = safeQuery("SELECT 1;", ["SELECT"]);
    expect(res).toBe("SELECT 1;");
  });

  it("mengizinkan titik koma di dalam string literal", () => {
    const res = safeQuery("SELECT * FROM users WHERE email = 'a;b';", ["SELECT"]);
    expect(res).toBe("SELECT * FROM users WHERE email = 'a;b';");
  });

  it("menolak kueri berganda yang dipisahkan titik koma", () => {
    expect(() => safeQuery("SELECT 1; SELECT 2", ["SELECT"])).toThrow(
      /Only a single SQL query is allowed/
    );
  });

  it("melempar error jika kueri kosong", () => {
    expect(() => safeQuery("  ", ["SELECT"])).toThrow(/SQL query cannot be empty/);
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
        user: "sa",
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

  it("mengembalikan resultset dan memotong baris sesuai maxRows", async () => {
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

  it("mengembalikan execute untuk DML tanpa result set", async () => {
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

  it("melempar ToolError saat koneksi gagal", async () => {
    mockConnect.mockRejectedValue(new Error("ECONNREFUSED"));

    const { runSql } = await import("../mssql.js");
    await expect(runSql("SELECT 1")).rejects.toThrow(/MSSQL: ECONNREFUSED/);
  });
});
