# E-commerce Website Wireframes

This is a code bundle for E-commerce Website Wireframes. The original project is available at https://www.figma.com/design/wr2vKZ03scjyqrn7SWdSWH/E-commerce-Website-Wireframes.

## Setup (for new clones / other developers)

1. **Install dependencies**
   ```bash
   npm i
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env` (or create `.env` with the same variables).
   - Set `DATABASE_URL` to your database connection string.
   - Set `JWT_SECRET` (required for auth).
   - For vendor verification emails: set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and optionally `SMTP_FROM` and `APP_URL`. If SMTP is not set, registration still works but the verification link is shown on the success page (dev only).

3. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```
   This applies all pending migrations and creates/updates the schema.

4. **Seed the database** (optional, for initial/sample data and test accounts)
   ```bash
   npm run seed
   ```
   After seeding, you can log in with:
   - **Admin**: `admin@example.com` / `Admin@123` → [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - **Vendor**: `vendor@example.com` / `Vendor@123` → [http://localhost:3000/vendor/login](http://localhost:3000/vendor/login)

5. **Start the app**
   ```bash
   npm run dev
   ```

## Running the code

- Run `npm i` to install the dependencies.
- Run `npm run dev` to start the development server.

## API documentation

- **Swagger UI**: Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs) for interactive API documentation (OpenAPI 3.0). The spec is served at [http://localhost:3000/api/openapi](http://localhost:3000/api/openapi).
- **Postman**: Import the collection from `postman/Indovypar-API.postman_collection.json`. Set the `baseUrl` variable (default `http://localhost:3000`). For vendor endpoints, run **Auth → Vendor Login** first so requests use the session cookie.
