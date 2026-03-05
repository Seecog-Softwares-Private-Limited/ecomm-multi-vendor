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
   - For **vendor verification** and **forgot-password** emails: set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and optionally `SMTP_FROM` and `APP_URL`. If SMTP is not set, emails are not sent; in development the app may show a reset link on the forgot-password success page so you can still test.

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
   - **Admin**: `admin@example.com` / `Admin@123` → [http://localhost:3004/admin/login](http://localhost:3004/admin/login)
   - **Vendor**: `vendor@example.com` / `Vendor@123` → [http://localhost:3004/vendor/login](http://localhost:3004/vendor/login)

5. **Start the app**
   ```bash
   npm run dev
   ```

## Running the code

- Run `npm i` to install the dependencies.
- Run `npm run dev` to start the development server.

## Deploying / Updating the server

After pulling new code (e.g. to a server like `13.234.232.60`), you **must** rebuild and restart so new routes (e.g. `/vendor/forgot-password`) are available. Otherwise you may get **404** for new pages.

On the server, from the project root:

```bash
npm ci          # or: npm install
npm run build
npx prisma migrate deploy   # if schema changed
# Then restart your process, e.g.:
# pm2 restart all
# or: systemctl restart your-app
```

Until the server runs a build that includes the new code, new routes will return 404.

## API documentation

- **Swagger UI**: Open [http://localhost:3004/api-docs](http://localhost:3004/api-docs) for interactive API documentation (OpenAPI 3.0). The spec is served at [http://localhost:3004/api/openapi](http://localhost:3004/api/openapi).
- **Postman**: Import the collection from `postman/Indovypar-API.postman_collection.json`. Set the `baseUrl` variable (default `http://localhost:3004`). For vendor endpoints, run **Auth → Vendor Login** first so requests use the session cookie.
