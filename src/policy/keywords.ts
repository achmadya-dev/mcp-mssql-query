import { stripComments } from "./sanitize.js";

export const READ_KEYWORDS: ReadonlySet<string> = new Set([
  "SELECT",
  "VALUES",
  "PRINT",
]);

export const DDL_KEYWORDS: ReadonlySet<string> = new Set([
  "CREATE",
  "ALTER",
  "DROP",
  "TRUNCATE",
  "RENAME",
  "GRANT",
  "REVOKE",
  "DENY",
]);

export interface BannedPattern {
  name: string;
  regex: RegExp;
  reason: string;
}

/** Konstruk SQL yang dilarang oleh kebijakan server (selalu ditolak). */
export const BANNED_PATTERNS: readonly BannedPattern[] = [
  {
    name: "cte",
    regex: /\bWITH\b/i,
    reason:
      "Common Table Expression (WITH ...) tidak diizinkan. Tulis ulang kueri tanpa CTE.",
  },
  {
    name: "row_number",
    regex: /\bROW_NUMBER\s*\(/i,
    reason:
      "Fungsi window ROW_NUMBER() tidak diizinkan. Gunakan pendekatan alternatif (mis. JOIN/agregasi).",
  },
  {
    name: "exec",
    regex: /\b(EXEC|EXECUTE)\b/i,
    reason:
      "EXEC/EXECUTE (stored procedure / dynamic SQL) tidak diizinkan oleh server MCP.",
  },
  {
    name: "merge",
    regex: /\bMERGE\s+INTO\b/i,
    reason:
      "MERGE INTO tidak diizinkan. Gunakan INSERT/UPDATE/DELETE eksplisit.",
  },
];

/** Ambil keyword pertama dari SQL (huruf besar, tanpa quote). */
export function firstKeyword(sql: string): string {
  const text = stripComments(sql).trim();
  if (!text) return "";
  const token = text
    .split(/\s+/)[0]!
    .toUpperCase()
    .replace(/^[`"\[]|[`"\]]$/g, "");
  return token;
}
