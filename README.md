# mcp-mssql-ts

Server [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) untuk Microsoft SQL Server. Tool `mssql_query` memungkinkan klien MCP (misalnya Cursor) menjalankan **satu** pernyataan T-SQL setiap kali dipanggil.

**Mode bawaan: hanya baca (read-only).** Perintah seperti `INSERT`, `UPDATE`, `DELETE`, dan DDL tidak akan dijalankan kecuali Anda mengaktifkan variabel lingkungan khusus (lihat bagian di bawah).

## Persyaratan

- Node.js **≥ 20**

Komunikasi memakai **stdio** (bukan HTTP). Kredensial dan opsi SQL Server diatur lewat variabel lingkungan pada konfigurasi MCP (`env`) atau di sistem.

## Instalasi di Cursor

1. Buka **Settings → MCP**, atau edit file `mcp.json` untuk akun Cursor Anda.
2. Tambahkan entri server seperti contoh berikut. Perintah `npx -y` akan mengambil paket dari npm registry lalu menjalankannya (tanpa instal global).

```json
{
  "mcpServers": {
    "mssql": {
      "command": "npx",
      "args": ["-y", "mcp-mssql-ts"],
      "env": {
        "MSSQL_HOST": "127.0.0.1",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "password"
      }
    }
  }
}
```

Sesuaikan nilai `env` dengan server SQL Server Anda.

## Manual dari clone repository

Clone repositori, pasang dependensi, lalu build:

```bash
git clone <url-repo> mcp-mssql-ts
cd mcp-mssql-ts
pnpm install && pnpm run build
```

Setelah itu, daftarkan server MCP dengan **`node`** dan **path absolut** ke file `dist/index.js` di folder proyek Anda:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["C:/Users/Username/proyek/mcp-mssql-ts/dist/index.js"],
      "env": {
        "MSSQL_HOST": "127.0.0.1",
        "MSSQL_USER": "sa",
        "MSSQL_PASSWORD": "password"
      }
    }
  }
}
```

Ganti path di `args` sesuai lokasi clone. Setelah mengubah sumber TypeScript, jalankan lagi `pnpm run build`.

## Variabel lingkungan

### Koneksi

| Variabel | Default | Keterangan |
|----------|---------|------------|
| `MSSQL_HOST` | `127.0.0.1` | Host SQL Server |
| `MSSQL_PORT` | `1433` | Port |
| `MSSQL_USER` | `sa` | Nama pengguna |
| `MSSQL_PASSWORD` | *(tidak diset = string kosong)* | Kata sandi |
| `MSSQL_DATABASE` | *(opsional)* | Database yang dipilih setelah koneksi |
| `MSSQL_INSTANCE_NAME` | *(opsional)* | Nama instance (mis. `SQLEXPRESS`) |
| `MSSQL_ENCRYPT` | `true` | Enkripsi koneksi |
| `MSSQL_TRUST_SERVER_CERTIFICATE` | `true` | Percayai sertifikat server (berguna untuk dev lokal) |
| `MSSQL_CONNECTION_TIMEOUT_MS` | `15000` | Batas waktu koneksi (ms) |
| `MSSQL_REQUEST_TIMEOUT_MS` | `15000` | Batas waktu permintaan (ms) |
| `MSSQL_MAX_ROWS` | `500` | Batas baris hasil `SELECT` yang ditampilkan |

### Mengizinkan operasi tulis

Perintah **baca** (`SELECT`, `VALUES`, `PRINT`, dan sejenisnya) selalu diperbolehkan.

Untuk mengizinkan **tulis** atau **DDL**, aktifkan jenis yang diinginkan dengan variabel berikut. Nilai yang dianggap aktif: `true`, `1`, `yes`, atau `on` (tidak case-sensitive).

| Variabel | Mengizinkan |
|----------|-------------|
| `ALLOW_INSERT_OPERATION` | `INSERT` |
| `ALLOW_UPDATE_OPERATION` | `UPDATE` |
| `ALLOW_DELETE_OPERATION` | `DELETE` |
| `ALLOW_DDL_OPERATION` | DDL (`CREATE`, `ALTER`, `DROP`, dll.) |

Jika suatu variabel tidak diset, atau nilainya bukan salah satu di atas, jenis operasi itu tetap **ditolak** (tetap read-only untuk jenis tersebut).

## Perilaku lain

- Satu permintaan hanya boleh berisi **satu** pernyataan T-SQL (tidak boleh beberapa perintah dipisah `;`).
- Hasil `SELECT` dikembalikan dalam format **JSON**; jumlah baris dibatasi oleh `MSSQL_MAX_ROWS`.
- Konstruk berikut **selalu ditolak**, terlepas dari pengaturan `ALLOW_*`:
  - Common Table Expression (`WITH ...`)
  - `ROW_NUMBER()`
  - `EXEC` / `EXECUTE`
  - `MERGE INTO`
