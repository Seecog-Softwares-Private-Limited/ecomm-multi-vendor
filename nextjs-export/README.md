# After pasting this folder into your Next.js project

You’ve pasted the full **nextjs-export** folder into your Next.js app. Follow these steps to get Home, Login, and Product Description pages working.

---

## Step 1: Place the components so Next.js can import them

You have two options.

### Option A – Keep the folder as-is (simplest)

Leave **nextjs-export** where it is. Your imports will use `@/nextjs-export/components/...` (see Step 3). No moving of files.

### Option B – Move components to project root (recommended)

Move the **components** folder out to the root of your project so you have:

```
your-nextjs-app/
  app/
  components/          ← move nextjs-export/components/ here (rename if needed)
  nextjs-export/
    styles/
    README.md
```

- In your project root, create a folder named **components** (if it doesn’t exist).
- Move **all files** from `nextjs-export/components/` into that root **components/** folder.

Then you can import with `@/components/...` (see Step 3).

---

## Step 2: Add fonts and styles

Open your main CSS file (usually **`app/globals.css`**).

1. **Fonts** – Add this at the top (or copy the content from `nextjs-export/styles/fonts.css`):

```css
@import url('https://fonts.googleapis.com/css2?family=Katibeh&family=Manrope:wght@400;500;600;700&family=Nunito:wght@700;800&display=swap');
```

2. **Tailwind** – If you use Tailwind, keep your existing lines:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

The pages use Tailwind classes, so Tailwind must be set up in this project.

---

## Step 3: Create the route files

Use the **App Router**: create these files under the **`app/`** directory.

### Home page – `app/page.tsx`

Create or replace **`app/page.tsx`** with:

```tsx
import { HomePage } from "@/components/HomePage";

export default function Page() {
  return <HomePage />;
}
```

If you kept the folder as-is (Option A), use:

```tsx
import { HomePage } from "@/nextjs-export/components/HomePage";
```

---

### Login page – `app/login/page.tsx`

Create the folder **`app/login/`** and inside it create **`page.tsx`**:

```tsx
import { LoginPage } from "@/components/LoginPage";

export default function Page() {
  return <LoginPage />;
}
```

(Use `@/nextjs-export/components/LoginPage` if you didn’t move the components.)

---

### Product description page – `app/product/page.tsx`

Create the folder **`app/product/`** and inside it create **`page.tsx`**:

```tsx
import { ProductDetailPage } from "@/components/ProductDetailPage";

export default function Page() {
  return <ProductDetailPage />;
}
```

(Use `@/nextjs-export/components/ProductDetailPage` if you didn’t move the components.)

Resulting structure:

```
app/
  layout.tsx
  page.tsx              ← Home
  globals.css
  login/
    page.tsx            ← Login
  product/
    page.tsx            ← Product description
```

---

## Step 4: Install dependency and check Tailwind

In the **root of your Next.js project**, run:

```bash
npm install lucide-react
```

or, if you use pnpm:

```bash
pnpm add lucide-react
```

Icons used in the pages come from **lucide-react**.

Make sure **Tailwind CSS** is installed and configured (e.g. `tailwind.config.js` or `tailwind.config.ts` and `postcss.config.js`). The components use Tailwind utility classes.

---

## Step 5: Path alias (if imports fail)

If `@/components/...` or `@/nextjs-export/components/...` don’t work, check **`tsconfig.json`** in the project root. You should have something like:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

So `@/components` points to the **components** folder at the project root, and `@/nextjs-export/components` to **nextjs-export/components** if you kept the folder as-is.

---

## Quick checklist

- [ ] Components are either in **nextjs-export/components** or moved to root **components/**.
- [ ] Font import added to **app/globals.css**.
- [ ] **app/page.tsx** renders `<HomePage />`.
- [ ] **app/login/page.tsx** renders `<LoginPage />`.
- [ ] **app/product/page.tsx** renders `<ProductDetailPage />`.
- [ ] **lucide-react** installed.
- [ ] Tailwind is set up.

After that, run `npm run dev` (or `pnpm dev`) and open:

- **/** → Home  
- **/login** → Login  
- **/product** → Product description  

You can delete the **nextjs-export** folder later if you’ve moved everything out and no longer need this README.
