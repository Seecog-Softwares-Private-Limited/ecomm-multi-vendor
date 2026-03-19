# Super Admin Backend

Express + MongoDB (Mongoose) + JWT API for the Super Admin panel.

## Setup

1. Install dependencies:
   ```bash
   cd super-admin-backend && npm install
   ```

2. Copy `.env.example` to `.env` and set:
   - `MONGODB_URI` – MongoDB connection string (default: `mongodb://localhost:27017/super_admin_db`)
   - `JWT_SECRET` – Secret for JWT signing
   - `PORT` – API port (default: 4000)

3. Start MongoDB (e.g. local or Atlas), then run:
   ```bash
   npm run dev
   ```

On first run, a default **Super Admin** is seeded:
- **Email:** superadmin@example.com  
- **Password:** SuperAdmin@123  

## API Base URL

- Default: `http://localhost:4000`

In the Next.js app, set `NEXT_PUBLIC_SUPER_ADMIN_API_URL=http://localhost:4000` (or your deployed API URL) so the Super Admin UI can call this backend.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /superadmin/auth/login | Login (email, password) → JWT + admin |
| GET | /superadmin/admins | List admins (search, filters, pagination) |
| POST | /superadmin/admins | Create admin (Super Admin only) |
| PUT | /superadmin/admins/:id | Update admin |
| DELETE | /superadmin/admins/:id | Delete admin |
| PUT | /superadmin/admins/:id/status | Set status (active/inactive/suspended) |
| PUT | /superadmin/admins/:id/approve | Body: `{ "action": "approve" \| "reject" }` |
| GET | /superadmin/roles | List roles + permissions |
| POST | /superadmin/roles | Create role |
| PUT | /superadmin/roles/:id | Update role |
| GET | /superadmin/audit-logs | List audit logs (filters, pagination) |

All routes except `/superadmin/auth/login` and `/superadmin/health` require:
- Header: `Authorization: Bearer <token>`
- Super Admin (or role with required permission for future RBAC on non–Super Admin routes).

## Sample responses

**POST /superadmin/auth/login**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "admin": {
      "id": "...",
      "name": "Super Admin",
      "email": "superadmin@example.com",
      "role": { "name": "Super Admin", "permissions": ["..."] },
      "isSuperAdmin": true,
      "status": "active",
      "approvalStatus": "approved"
    }
  }
}
```

**GET /superadmin/admins?page=1&limit=10**
```json
{
  "success": true,
  "data": {
    "admins": [...],
    "pagination": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
  }
}
```
