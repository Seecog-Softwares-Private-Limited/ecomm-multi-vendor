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

3. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```
   This applies all pending migrations and creates/updates the schema.

4. **Seed the database** (optional, for initial/sample data)
   ```bash
   npm run seed
   ```

5. **Start the app**
   ```bash
   npm run dev
   ```

## Running the code

- Run `npm i` to install the dependencies.
- Run `npm run dev` to start the development server.
