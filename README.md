# Platform Learn

Platform Learn adalah monorepo TypeScript untuk aplikasi Online Learning System. Repo ini berisi mobile app berbasis Expo, API server berbasis Express, shared database package berbasis Drizzle ORM, OpenAPI contract, generated React Query client, dan generated Zod schemas.

## Status Project

Project saat ini berada pada tahap fondasi dan prototype:

- Mobile app sudah memiliki flow demo untuk role `student`, `instructor`, dan `admin`.
- Data mobile masih memakai seed data lokal dan `AsyncStorage`.
- API server yang aktif saat ini baru endpoint health check: `GET /api/healthz`.
- OpenAPI spec saat ini baru mendokumentasikan health check.
- Database schema sudah tersedia di package `@workspace/db` dan dapat di-push ke PostgreSQL dengan Drizzle Kit.

## Tech Stack

- Monorepo: pnpm workspaces
- Language: TypeScript
- Runtime: Node.js 24
- Mobile: Expo, React Native, Expo Router, React Query
- API: Express 5, CORS, Pino logger
- Database: PostgreSQL, Drizzle ORM, Drizzle Kit
- Contract: OpenAPI 3.1
- Codegen: Orval untuk React Query client dan Zod schemas
- Build: esbuild untuk API server

## Struktur Workspace

```text
platform_learn/
  artifacts/
    api-server/          Express API server
    mobile/              Expo React Native app
    mockup-sandbox/      Vite preview sandbox untuk komponen UI/mockup
  lib/
    api-client-react/    Generated React Query client dari OpenAPI
    api-spec/            Source of truth OpenAPI spec dan Orval config
    api-zod/             Generated Zod schemas dari OpenAPI
    db/                  Drizzle ORM client dan database schema
  scripts/               Utility scripts
```

## Package Penting

| Package | Lokasi | Fungsi |
| --- | --- | --- |
| `@workspace/api-server` | `artifacts/api-server` | Backend Express API |
| `@workspace/mobile` | `artifacts/mobile` | Aplikasi Expo/React Native |
| `@workspace/mockup-sandbox` | `artifacts/mockup-sandbox` | Preview sandbox untuk komponen |
| `@workspace/db` | `lib/db` | Koneksi database dan schema Drizzle |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI spec dan codegen |
| `@workspace/api-client-react` | `lib/api-client-react` | Generated React Query client |
| `@workspace/api-zod` | `lib/api-zod` | Generated Zod validators |

## Setup Awal

Install dependency dari root repo:

```powershell
pnpm install
```

Siapkan PostgreSQL lalu isi environment variable yang diperlukan.

Root `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/platform_learn
PORT=5000
NODE_ENV=development
```

API server membaca root `.env` melalui path `../../.env` dari folder `artifacts/api-server`.

Untuk Drizzle command di package database, pastikan `DATABASE_URL` juga tersedia untuk `lib/db`, misalnya melalui `lib/db/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/platform_learn
```

Jangan commit file `.env` yang berisi credential asli.

## Command Utama

Jalankan dari root repo `D:\platform_learn`.

| Command | Fungsi |
| --- | --- |
| `pnpm run typecheck` | Typecheck seluruh workspace utama |
| `pnpm run build` | Typecheck lalu build package yang punya script build |
| `pnpm --filter @workspace/api-server run dev` | Build dan jalankan API server |
| `pnpm --filter @workspace/mobile run dev` | Jalankan Expo dev server di port `8081` |
| `pnpm --filter @workspace/mockup-sandbox run dev` | Jalankan Vite preview sandbox |
| `pnpm --filter @workspace/api-spec run codegen` | Generate API client dan Zod schemas dari OpenAPI |
| `pnpm --filter @workspace/db run push` | Push schema Drizzle ke PostgreSQL |
| `pnpm --filter @workspace/db run push-force` | Push schema dengan auto-approve perubahan berisiko |

## Menjalankan API Server

API server berada di `artifacts/api-server`.

```powershell
pnpm --filter @workspace/api-server run dev
```

Script `dev` akan menjalankan build lalu start server. Server membutuhkan `PORT` dari root `.env`. Jika memakai contoh di atas, API tersedia di:

```text
http://localhost:5000/api/healthz
```

Endpoint aktif saat ini:

| Method | Path | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/healthz` | Health check, mengembalikan `{ "status": "ok" }` |

Catatan: file route `course.ts` dan `assignments.ts` masih kosong, dan route user belum terpasang sebagai endpoint Express. Tambahkan route ke `artifacts/api-server/src/routes/index.ts` ketika API resource tersebut sudah siap.

## Menjalankan Mobile App

Mobile app berada di `artifacts/mobile`.

```powershell
pnpm --filter @workspace/mobile run dev
```

Expo akan berjalan di localhost port `8081`. Aplikasi memakai Expo Router dan memiliki area role-based:

- `/(auth)` untuk login
- `/(student)` untuk dashboard student
- `/(instructor)` untuk dashboard instructor
- `/(admin)` untuk dashboard admin
- `/course/[id]` untuk detail course

### Demo Accounts

Login demo tersimpan di `artifacts/mobile/context/AuthContext.tsx`.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@ols.edu` | `admin123` |
| Instructor | `sarah@ols.edu` | `pass123` |
| Instructor | `james@ols.edu` | `pass123` |
| Student | `alex@ols.edu` | `pass123` |
| Student | `maria@ols.edu` | `pass123` |
| Student | `liam@ols.edu` | `pass123` |

Data course, assignment, submission, progress, dan user demo berada di `artifacts/mobile/context/DataContext.tsx`. Perubahan data di mobile disimpan lokal menggunakan `AsyncStorage`.

## Database

Database package berada di `lib/db`.

Source of truth schema:

```text
lib/db/src/schema/index.ts
lib/db/src/schema/models/user.ts
lib/db/src/schema/models/courses.ts
lib/db/src/schema/models/assignments.ts
lib/db/src/schema/models/enrollments.ts
```

Tabel yang didefinisikan saat ini:

- `users`
- `courses`
- `lessons`
- `assignments`
- `submissions`
- `enrollments`
- `progress`

Push schema ke database:

```powershell
pnpm --filter @workspace/db run push
```

Drizzle config berada di `lib/db/drizzle.config.ts`. Path schema memakai relative path:

```ts
schema: "./src/schema/index.ts"
```

Gunakan relative path ini agar Drizzle Kit dapat menemukan file schema dengan aman, terutama di Windows.

## OpenAPI dan Codegen

OpenAPI source of truth berada di:

```text
lib/api-spec/openapi.yaml
```

Generate ulang client dan schema setelah mengubah OpenAPI:

```powershell
pnpm --filter @workspace/api-spec run codegen
```

Output codegen:

```text
lib/api-client-react/src/generated/
lib/api-zod/src/generated/
```

Jangan edit file generated secara manual. Ubah `openapi.yaml`, lalu jalankan `codegen`.

## Alur Pengembangan yang Disarankan

1. Update database schema di `lib/db/src/schema/models`.
2. Jalankan `pnpm --filter @workspace/db run push` untuk sync ke PostgreSQL.
3. Tambahkan atau update endpoint API di `artifacts/api-server/src/routes`.
4. Update contract di `lib/api-spec/openapi.yaml`.
5. Jalankan `pnpm --filter @workspace/api-spec run codegen`.
6. Pakai generated client dari `@workspace/api-client-react` di frontend/mobile.
7. Jalankan `pnpm run typecheck` sebelum commit.

## Catatan Penting

- API server start script membaca root `.env` dari folder `artifacts/api-server` menggunakan path `../../.env`.
- Drizzle command membutuhkan `DATABASE_URL` tersedia saat command dijalankan dari package `lib/db`.
- Mobile app saat ini belum sepenuhnya memakai API backend; sebagian besar data masih lokal.
- OpenAPI title `Api` jangan diganti karena Orval config bergantung pada nama output tersebut.
- `pnpm-workspace.yaml` memakai `minimumReleaseAge: 1440` sebagai proteksi supply-chain untuk dependency baru.

## Troubleshooting

### Drizzle: `No schema files found`

Pastikan `lib/db/drizzle.config.ts` memakai:

```ts
schema: "./src/schema/index.ts"
```

Hindari absolute Windows path seperti `D:\...\src\schema\index.ts` di config Drizzle karena path tersebut dapat gagal dicocokkan oleh glob Drizzle Kit.

### API: `PORT environment variable is required`

Tambahkan `PORT` di root `.env`:

```env
PORT=5000
```

### API atau DB: koneksi PostgreSQL gagal

Periksa:

- PostgreSQL sedang berjalan.
- Database `platform_learn` sudah dibuat.
- `DATABASE_URL` benar.
- User database punya akses ke database tersebut.
