import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcrypt";

/** Parse MySQL-style URL so the database name is never lost (adapter must use the right schema). */
function parseDbUrl(url: string): { host: string; port: number; user: string; password: string; database: string } {
  try {
    const u = new URL(url.replace(/^mysql:\/\//, "http://"));
    const database = u.pathname?.replace(/^\//, "").split("?")[0] || "markethub";
    return {
      host: u.hostname || "localhost",
      port: parseInt(u.port || "3306", 10),
      user: decodeURIComponent(u.username || "root"),
      password: decodeURIComponent(u.password || ""),
      database: database || "markethub",
    };
  } catch {
    return { host: "localhost", port: 3306, user: "root", password: "", database: "markethub" };
  }
}

const dbUrl = process.env.DATABASE_URL!;
const dbConfig = parseDbUrl(dbUrl);
const adapter = new PrismaMariaDb(dbConfig);
const prisma = new PrismaClient({ adapter });

/** Test vendor credentials: vendor@example.com / Vendor@123 */
const VENDOR_EMAIL = "vendor@example.com";
const VENDOR_PASSWORD = "Vendor@123";

/** Test admin credentials: admin@example.com / Admin@123 */
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "Admin@123";

const BCRYPT_ROUNDS = 12;

/** Seed data for User table (customers). Each gets a default address if missing. */
const CUSTOMER_USERS: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  addresses: { type: "HOME" | "OFFICE" | "OTHER"; fullName: string; line1: string; line2?: string; city: string; state: string; pincode: string; phone: string; isDefault?: boolean }[];
}[] = [
  {
    email: "customer@example.com",
    password: "Password1",
    firstName: "Test",
    lastName: "Customer",
    phone: "9876543210",
    addresses: [
      { type: "HOME", fullName: "Test Customer", line1: "123 Test Street", city: "Bangalore", state: "Karnataka", pincode: "560001", phone: "9876543210", isDefault: true },
      { type: "OFFICE", fullName: "Test Customer", line1: "456 Office Park", line2: "Block A", city: "Bangalore", state: "Karnataka", pincode: "560002", phone: "9876543210", isDefault: false },
    ],
  },
  {
    email: "john.doe@example.com",
    password: "Password1",
    firstName: "John",
    lastName: "Doe",
    phone: "9123456789",
    addresses: [
      { type: "HOME", fullName: "John Doe", line1: "10 Main Road", city: "Mumbai", state: "Maharashtra", pincode: "400001", phone: "9123456789", isDefault: true },
    ],
  },
  {
    email: "jane.smith@example.com",
    password: "Password1",
    firstName: "Jane",
    lastName: "Smith",
    phone: "9988776655",
    addresses: [
      { type: "HOME", fullName: "Jane Smith", line1: "7 Green Avenue", city: "Delhi", state: "Delhi", pincode: "110001", phone: "9988776655", isDefault: true },
    ],
  },
  {
    email: "rahul.sharma@example.com",
    password: "Password1",
    firstName: "Rahul",
    lastName: "Sharma",
    phone: "8765432109",
    addresses: [
      { type: "HOME", fullName: "Rahul Sharma", line1: "22 Park Street", city: "Kolkata", state: "West Bengal", pincode: "700016", phone: "8765432109", isDefault: true },
    ],
  },
  {
    email: "priya.patel@example.com",
    password: "Password1",
    firstName: "Priya",
    lastName: "Patel",
    phone: "7654321098",
    addresses: [
      { type: "HOME", fullName: "Priya Patel", line1: "5 Sardar Nagar", city: "Ahmedabad", state: "Gujarat", pincode: "380015", phone: "7654321098", isDefault: true },
    ],
  },
];

const CATEGORIES: { slug: string; name: string; subCategories: { slug: string; name: string }[] }[] = [
  { slug: "electronics", name: "Electronics", subCategories: [{ slug: "mobiles", name: "Mobile Phones" }, { slug: "laptops", name: "Laptops" }, { slug: "accessories", name: "Accessories" }] },
  { slug: "fashion", name: "Fashion", subCategories: [{ slug: "mens", name: "Men's Clothing" }, { slug: "womens", name: "Women's Clothing" }, { slug: "kids", name: "Kids Wear" }] },
  { slug: "home", name: "Home & Kitchen", subCategories: [{ slug: "kitchen", name: "Kitchen" }, { slug: "furniture", name: "Furniture" }, { slug: "decor", name: "Home Decor" }] },
  { slug: "books", name: "Books", subCategories: [{ slug: "fiction", name: "Fiction" }, { slug: "nonfiction", name: "Non-Fiction" }, { slug: "education", name: "Educational" }] },
];

async function main() {
  const dbName = dbConfig.database;
  console.log("Database:", dbName, "— ensure this matches MySQL Workbench schema.");

  // Seed users + addresses first so they are created even if later steps fail
  console.log("Seeding users and addresses...");
  for (const u of CUSTOMER_USERS) {
    const passwordHash = await bcrypt.hash(u.password, BCRYPT_ROUNDS);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, firstName: u.firstName, lastName: u.lastName, phone: u.phone },
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
      },
    });

    for (const addr of u.addresses) {
      const existing = await prisma.address.findFirst({
        where: {
          userId: user.id,
          line1: addr.line1,
          pincode: addr.pincode,
          deletedAt: null,
        },
      });
      if (!existing) {
        await prisma.address.create({
          data: {
            userId: user.id,
            type: addr.type,
            fullName: addr.fullName,
            line1: addr.line1,
            line2: addr.line2 ?? null,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            phone: addr.phone,
            isDefault: addr.isDefault ?? false,
          },
        });
      }
    }
  }
  console.log("  →", CUSTOMER_USERS.length, "users (and addresses) done.");

  const vendorPasswordHash = await bcrypt.hash(VENDOR_PASSWORD, BCRYPT_ROUNDS);
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: adminPasswordHash, name: "Admin Demo" },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      name: "Admin Demo",
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

  const electronics = await prisma.category.findFirst({ where: { slug: "electronics" } });
  const mobiles = electronics
    ? await prisma.subCategory.findFirst({ where: { categoryId: electronics.id, slug: "mobiles" } })
    : null;

  const seller = await prisma.seller.upsert({
    where: { email: VENDOR_EMAIL },
    update: {
      passwordHash: vendorPasswordHash,
      status: "APPROVED",
      emailVerified: true,
      primaryCategoryId: electronics?.id ?? undefined,
    },
    create: {
      email: VENDOR_EMAIL,
      passwordHash: vendorPasswordHash,
      businessName: "Tech Store India",
      ownerName: "Vendor Demo",
      status: "APPROVED",
      emailVerified: true,
      primaryCategoryId: electronics?.id ?? undefined,
    },
  });

  if (electronics && mobiles) {
    await prisma.product.upsert({
      where: { sellerId_sku: { sellerId: seller.id, sku: "SEED-SKU-001" } },
      update: { status: "ACTIVE", stock: 100 },
      create: {
        sellerId: seller.id,
        categoryId: electronics.id,
        subCategoryId: mobiles.id,
        name: "Seed Test Product",
        description: "Product for Postman Create Order testing",
        sku: "SEED-SKU-001",
        mrp: 999,
        sellingPrice: 899,
        gstPercent: 18,
        stock: 100,
        returnPolicy: "DAYS_7",
        status: "ACTIVE",
      },
    });
  }

  // Verify: count users (must match what you see in MySQL Workbench)
  const userCount = await prisma.user.count();
  console.log("");
  console.log("Verify: users table has", userCount, "row(s) in database:", dbName);
  console.log("In MySQL Workbench, select schema '" + dbName + "' (left panel) then run: SELECT * FROM users;");
  if (userCount === 0) console.log("WARNING: 0 users — check that DATABASE_URL in .env points to the same DB as Workbench.");
  console.log("");
  console.log("Seed complete.");
  console.log("  Admin:   ", ADMIN_EMAIL, "/", ADMIN_PASSWORD, "→ /admin/login");
  console.log("  Vendor:  ", seller.email, "/", VENDOR_PASSWORD, "→ Vendor Login (Postman); status APPROVED, 1 ACTIVE product");
  console.log("  Users:   ", CUSTOMER_USERS.length, "customers (users + addresses):");
  CUSTOMER_USERS.forEach((u) => console.log("    -", u.email, "/", u.password, "→", u.addresses.length, "address(es)"));
  console.log("  Categories: electronics, fashion, home, books (with sub-categories)");
  console.log("  Use: Vendor Login → Get Create Order Test Data → Create Order → Get Orders");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
