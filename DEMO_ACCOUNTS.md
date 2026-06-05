# Demo Account untuk Testing

Setelah menjalankan `pnpm seed` di `lib/db`, berikut adalah akun demo yang tersedia untuk testing:

## Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | `student@demo.com` | `password123` |
| **Instructor** | `instructor@demo.com` | `password123` |
| **Admin** | `admin@demo.com` | `password123` |

## Setup

### 1. Pastikan Database Sudah Disetup
Database harus sudah dibuat dan connection string sudah di `.env`:
```bash
DATABASE_URL=postgresql://user:password@host:5432/database_name
```

### 2. Push Database Schema
```bash
cd lib/db
pnpm push
```

### 3. Seed Demo Users
```bash
cd lib/db
pnpm seed
```

## Testing Login Endpoint

### cURL Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@demo.com",
    "password": "password123"
  }'
```

### Expected Response (200 OK)
```json
{
  "id": "user-student-001",
  "name": "Demo Student",
  "email": "student@demo.com",
  "role": "student",
  "isActive": true
}
```

### Error Response (401 Unauthorized)
```json
{
  "error": "Invalid email or password"
}
```

## Testing Logout Endpoint

### cURL Request
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json"
```

### Expected Response (200 OK)
```json
{
  "success": true
}
```

## Troubleshooting

### Login gagal dengan pesan "Invalid email or password"
1. Pastikan database sudah di-seed: `pnpm seed` di `lib/db`
2. Periksa apakah DATABASE_URL sudah benar di `.env`
3. Verifikasi password dengan connect ke database dan check hash

### Database connection error
1. Pastikan PostgreSQL server running
2. Verify DATABASE_URL format: `postgresql://user:password@host:port/db`
3. Test connection manual dengan psql atau database client
