/**
 * Insert only the 5 customer users (+ addresses) into the database.
 * Does not touch admin, vendor, categories, or products.
 *
 * Run: npm run seed:users  or  npx tsx scripts/seed-users-only.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcrypt";

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

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ? parseDbUrl(process.env.DATABASE_URL) : { host: "localhost", port: 3306, user: "root", password: "", database: "markethub" });
const prisma = new PrismaClient({ adapter });
const BCRYPT_ROUNDS = 12;

const CUSTOMER_USERS: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  addresses: {
    type: "HOME" | "OFFICE" | "OTHER";
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    isDefault?: boolean;
  }[];
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

async function main() {
  console.log("Seeding 5 users (+ addresses) only...");

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

  console.log("Done. 5 users (and their addresses) upserted.");
  CUSTOMER_USERS.forEach((u) => console.log("  -", u.email, "→", u.addresses.length, "address(es)"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
