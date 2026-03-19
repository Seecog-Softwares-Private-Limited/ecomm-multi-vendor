# Super Admin Panel

The Super Admin panel uses the **same MySQL database and Prisma** as the rest of the app. No separate backend or MongoDB is required.

## How to use

1. Run migrations (if not already applied):
   ```bash
   npx prisma migrate deploy
   ```

2. Seed the Super Admin user (if not already done):
   ```bash
   npx prisma db seed
   ```
   This creates:
   - **Super Admin:** superadmin@example.com / SuperAdmin@123  
   - **Admin role** "Super Admin" with full permissions

3. Start the app (e.g. `node app.js dev`) and open:
   **http://localhost:3005/superadmin/login**

4. Log in with **superadmin@example.com** / **SuperAdmin@123**

## Features

- **Auth:** Login with email/password; JWT stored in `localStorage`; only admins with `isSuperAdmin: true` can access.
- **Admins:** List, create, edit, delete admins; set status (ACTIVE/INACTIVE/SUSPENDED); approve/reject.
- **Roles:** Create and edit roles; assign permissions (seller_management, catalog, orders, finance, marketing, support, settings).
- **Audit logs:** View admin actions (login, create/update admin, etc.) with filters.

## Database (Prisma/MySQL)

- **Admin** – extended with `roleId`, `status`, `approvalStatus`, `isSuperAdmin`, `lastLoginAt`
- **AdminRole** – name, permissions (JSON array)
- **AdminAuditLog** – adminId, action, module, metadata, createdAt

API routes live under `/api/superadmin/` (auth/login, admins, roles, audit-logs) and use the same JWT secret as the rest of the app.
