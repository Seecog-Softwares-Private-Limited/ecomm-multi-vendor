# Cursor prompt – paste this in your target Next.js project

After pasting the **nextjs-export** folder into your Next.js project root, open this project in Cursor, then paste the prompt below into Cursor Chat (or Composer). Cursor will wire up the pages and run steps for you.

---

## Copy everything below this line and paste into Cursor

```
I pasted the "nextjs-export" folder at my project root. Please set up the app so the Home, Login, and Product Description pages from that folder work.

Do the following:

1. **Components**
   - Either move the contents of `nextjs-export/components/` into a root-level `components/` folder in this project, or keep them inside `nextjs-export/components/` and I'll use that path in imports. Prefer moving to root `components/` if that fits the project structure.

2. **Fonts**
   - In `app/globals.css` (or the main global CSS file), add at the top:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Katibeh&family=Manrope:wght@400;500;600;700&family=Nunito:wght@700;800&display=swap');
   ```
   - Keep any existing Tailwind or other CSS imports.

3. **Routes (App Router)**
   - **Home:** In `app/page.tsx`, render the `HomePage` component from `@/components/HomePage` (or `@/nextjs-export/components/HomePage` if you kept the folder as-is).
   - **Login:** Create `app/login/page.tsx` that renders the `LoginPage` component from the same components source.
   - **Product:** Create `app/product/page.tsx` that renders the `ProductDetailPage` component from the same components source.
   - Use default exports: `export default function Page() { return <HomePage />; }` (and same pattern for Login and Product).

4. **Dependency**
   - Ensure `lucide-react` is installed. If not, add it to package.json and run the install command.

5. **Path alias**
   - If `@/components` or `@/nextjs-export` does not resolve, check or add the matching path in `tsconfig.json` so imports work.

After this, running `npm run dev` should show:
- `/` → Home page
- `/login` → Login page  
- `/product` → Product description page
```

---

## Shorter version (if you prefer)

If you want a minimal prompt, use this instead:

```
I pasted the "nextjs-export" folder in this project root. Please wire it up: add the Google font import to app/globals.css, create app/page.tsx (HomePage), app/login/page.tsx (LoginPage), and app/product/page.tsx (ProductDetailPage) importing from the pasted components, and ensure lucide-react is installed. Prefer moving nextjs-export/components to root components/ folder.
```
