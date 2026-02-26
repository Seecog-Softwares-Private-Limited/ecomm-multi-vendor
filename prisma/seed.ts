import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/** Test vendor credentials: vendor@example.com / Vendor@123 */
const VENDOR_EMAIL = "vendor@example.com";
const VENDOR_PASSWORD = "Vendor@123";
const BCRYPT_ROUNDS = 12;

const CATEGORIES: { slug: string; name: string; subCategories: { slug: string; name: string }[] }[] = [
  { slug: "electronics", name: "Electronics", subCategories: [{ slug: "mobiles", name: "Mobile Phones" }, { slug: "laptops", name: "Laptops" }, { slug: "accessories", name: "Accessories" }] },
  { slug: "fashion", name: "Fashion", subCategories: [{ slug: "mens", name: "Men's Clothing" }, { slug: "womens", name: "Women's Clothing" }, { slug: "kids", name: "Kids Wear" }] },
  { slug: "home", name: "Home & Kitchen", subCategories: [{ slug: "kitchen", name: "Kitchen" }, { slug: "furniture", name: "Furniture" }, { slug: "decor", name: "Home Decor" }] },
  { slug: "books", name: "Books", subCategories: [{ slug: "fiction", name: "Fiction" }, { slug: "nonfiction", name: "Non-Fiction" }, { slug: "education", name: "Educational" }] },
];

async function main() {
  const passwordHash = await bcrypt.hash(VENDOR_PASSWORD, BCRYPT_ROUNDS);

  const seller = await prisma.seller.upsert({
    where: { email: VENDOR_EMAIL },
    update: { passwordHash, status: "DRAFT" },
    create: {
      email: VENDOR_EMAIL,
      passwordHash,
      businessName: "Tech Store India",
      ownerName: "Vendor Demo",
      status: "DRAFT",
    },
  });

  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { slug: cat.slug, name: cat.name, sortOrder: 0 },
    });
    for (const sub of cat.subCategories) {
      await prisma.subCategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: sub.slug } },
        update: {},
        create: { categoryId: category.id, slug: sub.slug, name: sub.name, sortOrder: 0 },
      });
    }
  }

  console.log("Seed complete. Test vendor:");
  console.log("  Email:", seller.email);
  console.log("  Password: Vendor@123");
  console.log("  Login at: /vendor/login");
  console.log("  Categories: electronics, fashion, home, books (with sub-categories)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
