import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/** Test vendor credentials: vendor@example.com / Vendor@123 */
const VENDOR_EMAIL = "vendor@example.com";
const VENDOR_PASSWORD = "Vendor@123";

/** Test admin credentials: admin@example.com / Admin@123 */
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "Admin@123";

/** Super Admin (full control): superadmin@example.com / SuperAdmin@123 */
const SUPER_ADMIN_EMAIL = "superadmin@example.com";
const SUPER_ADMIN_PASSWORD = "SuperAdmin@123";
const SUPER_ADMIN_PERMISSIONS = ["seller_management", "catalog", "orders", "finance", "marketing", "support", "settings"];

/** Test customer credentials (for cart, orders): customer@example.com / Customer@123 */
const CUSTOMER_EMAIL = "customer@example.com";
const CUSTOMER_PASSWORD = "Customer@123";

const BCRYPT_ROUNDS = 12;

const CATEGORIES: { slug: string; name: string; subCategories: { slug: string; name: string }[] }[] = [
  { slug: "electronics", name: "Electronics", subCategories: [{ slug: "mobiles", name: "Mobile Phones" }, { slug: "laptops", name: "Laptops" }, { slug: "accessories", name: "Accessories" }] },
  { slug: "fashion", name: "Fashion", subCategories: [{ slug: "mens", name: "Men's Clothing" }, { slug: "womens", name: "Women's Clothing" }, { slug: "kids", name: "Kids Wear" }] },
  { slug: "home", name: "Home & Kitchen", subCategories: [{ slug: "kitchen", name: "Kitchen" }, { slug: "furniture", name: "Furniture" }, { slug: "decor", name: "Home Decor" }] },
  { slug: "books", name: "Books", subCategories: [{ slug: "fiction", name: "Fiction" }, { slug: "nonfiction", name: "Non-Fiction" }, { slug: "education", name: "Educational" }] },
  { slug: "sports", name: "Sports", subCategories: [{ slug: "fitness", name: "Fitness" }, { slug: "outdoor", name: "Outdoor" }, { slug: "team-sports", name: "Team Sports" }, { slug: "footwear", name: "Sports Footwear" }] },
  { slug: "beauty", name: "Beauty", subCategories: [{ slug: "skincare", name: "Skincare" }, { slug: "makeup", name: "Makeup" }, { slug: "haircare", name: "Haircare" }] },
];

/** Reusable smartphone image URLs (Unsplash) for seed products. */
const PHONE_IMAGES = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
  "https://images.unsplash.com/photo-1592286927505-d0d64a2d62a2?w=400",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400",
  "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400",
  "https://images.unsplash.com/photo-1574944985070-8f3ebcfe601e?w=400",
  "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400",
  "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400",
  "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400",
  "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400",
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
];

/** Sports / fitness image URLs (Unsplash) for seed. */
const SPORTS_IMAGES = [
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400",
  "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400",
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c149e?w=400",
  "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400",
];

/** Fashion / clothing image URLs (Unsplash) for seed. */
const FASHION_IMAGES = [
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400",
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400",
  "https://images.unsplash.com/photo-1558769132-cb1aea913033?w=400",
  "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
];

/** Beauty / skincare image URLs (Unsplash) for seed. */
const BEAUTY_IMAGES = [
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
  "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=400",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
  "https://images.unsplash.com/photo-1631214524026-ab64e1f8f0b2?w=400",
  "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400",
  "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
];

/** Home & Kitchen image URLs (Unsplash) for seed. */
const HOME_IMAGES = [
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
  "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400",
  "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400",
  "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400",
  "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
  "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400",
  "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400",
  "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400",
];

/** Book cover image URLs (Unsplash) for seed. */
const BOOK_IMAGES = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400",
  "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400",
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
];

type BookProduct = {
  name: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  brand: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  subSlug: string;
};

type SportsProduct = {
  name: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  brand: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  subSlug: string;
};

type FashionProduct = {
  name: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  brand: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  subSlug: string;
};

type BeautyProduct = {
  name: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  brand: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  subSlug: string;
};

type HomeProduct = {
  name: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  brand: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  subSlug: string;
};

type MobileProduct = {
  name: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  brand: string;
  rating: number;
  reviews: number;
  imageUrl: string;
};

/** Build home & kitchen products for Kitchen, Furniture, Home Decor. */
function buildHomeProducts(): HomeProduct[] {
  const items: { name: string; brand: string; subSlug: string }[] = [
    { name: "Non-Stick Cookware Set 5 Pcs", brand: "Prestige", subSlug: "kitchen" },
    { name: "Electric Kettle 1.5L", brand: "Philips", subSlug: "kitchen" },
    { name: "Mixer Grinder 750W", brand: "Bajaj", subSlug: "kitchen" },
    { name: "Air Fryer 4.5L", brand: "Philips", subSlug: "kitchen" },
    { name: "Stainless Steel Cutlery Set 24 Pcs", brand: "Bombay Dyeing", subSlug: "kitchen" },
    { name: "Food Container Set 10 Pcs", brand: "Tupperware", subSlug: "kitchen" },
    { name: "Chopping Board Set of 3", brand: "Bamboo Tree", subSlug: "kitchen" },
    { name: "Pressure Cooker 5L", brand: "Hawkins", subSlug: "kitchen" },
    { name: "Blender 500W", brand: "Morphy Richards", subSlug: "kitchen" },
    { name: "Dinner Set Ceramic 24 Pcs", brand: "Cello", subSlug: "kitchen" },
    { name: "Wooden Study Table", brand: "Nilkamal", subSlug: "furniture" },
    { name: "Office Chair Ergonomic", brand: "Green Soul", subSlug: "furniture" },
    { name: "Bookshelf 5 Tier", brand: "Spacewood", subSlug: "furniture" },
    { name: "Queen Size Bed with Storage", brand: "Wakefit", subSlug: "furniture" },
    { name: "Sofa Set 3+1+1", brand: "Nilkamal", subSlug: "furniture" },
    { name: "Dining Table 6 Seater", brand: "Godrej Interio", subSlug: "furniture" },
    { name: "TV Unit Wall Mount", brand: "Spacewood", subSlug: "furniture" },
    { name: "Wardrobe 2 Door", brand: "HomeTown", subSlug: "furniture" },
    { name: "Coffee Table Glass Top", brand: "Nilkamal", subSlug: "furniture" },
    { name: "Shoe Rack 4 Tier", brand: "Spacewood", subSlug: "furniture" },
    { name: "Table Lamp LED", brand: "Ikea", subSlug: "decor" },
    { name: "Wall Art Canvas Set of 3", brand: "HomeTown", subSlug: "decor" },
    { name: "Floor Rug 5x7 ft", brand: "Jaipur Rugs", subSlug: "decor" },
    { name: "Curtain Pair 2 Panels", brand: "HomeTown", subSlug: "decor" },
    { name: "Vase Set Ceramic", brand: "Ikea", subSlug: "decor" },
    { name: "Photo Frame Collage Set", brand: "Hometown", subSlug: "decor" },
    { name: "Cushion Cover Set of 4", brand: "Bombay Dyeing", subSlug: "decor" },
    { name: "Artificial Plant Pot", brand: "Ikea", subSlug: "decor" },
    { name: "Clock Wall Decorative", brand: "Ajanta", subSlug: "decor" },
    { name: "Mirror Wall Mount 24 inch", brand: "Spacewood", subSlug: "decor" },
  ];
  const out: HomeProduct[] = [];
  items.forEach((t, i) => {
    const mrp = 499 + Math.floor(Math.random() * 15000);
    const sellingPrice = Math.round(mrp * (0.72 + Math.random() * 0.26));
    out.push({
      name: t.name,
      sku: `HM-${t.subSlug.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(2, "0")}`,
      mrp,
      sellingPrice: Math.min(sellingPrice, mrp - 1),
      brand: t.brand,
      rating: Number((3.7 + Math.random() * 1.3).toFixed(1)),
      reviews: 50 + Math.floor(Math.random() * 700),
      imageUrl: HOME_IMAGES[i % HOME_IMAGES.length],
      subSlug: t.subSlug,
    });
  });
  return out;
}

const HOME_PRODUCTS = buildHomeProducts();

/** Build at least 10 products per brand with images. */
function buildMobileProducts(): MobileProduct[] {
  const brands = [
    { brand: "Apple", prefix: "APP", models: ["iPhone 15 Pro Max 256GB - Titanium Blue", "iPhone 15 Pro 128GB - Natural", "iPhone 15 128GB - Black", "iPhone 14 Plus 128GB - Blue", "iPhone 14 128GB - Midnight", "iPhone 13 128GB - Starlight", "iPhone SE 64GB - White", "iPhone 15 Pro Max 512GB - Black", "iPhone 14 Pro 256GB - Purple", "iPhone 12 64GB - Red"] },
    { brand: "Samsung", prefix: "SAM", models: ["Galaxy S24 Ultra - Phantom Black", "Galaxy S24+ 256GB - Violet", "Galaxy S24 128GB - Onyx", "Galaxy A54 5G 128GB - Awesome Graphite", "Galaxy Z Flip 5 256GB - Lavender", "Galaxy M34 5G 128GB - Midnight Blue", "Galaxy F54 256GB - Stardust Silver", "Galaxy A34 5G 128GB - Awesome Violet", "Galaxy S23 FE 256GB - Cream", "Galaxy M14 5G 64GB - Berry Blue"] },
    { brand: "OnePlus", prefix: "OP", models: ["12 5G 256GB - Silky Black", "12R 5G 256GB - Cool Blue", "Nord CE 3 5G 128GB - Aqua Surge", "Nord 3 5G 256GB - Tempest Gray", "11R 5G 256GB - Sonic Black", "Open 256GB - Emerald Dusk", "Nord CE 2 5G 128GB - Bahama Blue", "10 Pro 5G 256GB - Volcanic Black", "Nord N30 5G 128GB - Chromatic Gray", "Pad Go 128GB - LTE"] },
    { brand: "Xiaomi", prefix: "XIA", models: ["14 5G 256GB - Black", "13 Pro 5G 256GB - Black", "14 Ultra 256GB - Black", "Redmi Note 13 Pro+ 5G 256GB - Aurora Purple", "Redmi 13C 5G 128GB - Starlight Black", "Redmi Note 12 Pro 5G 128GB - Midnight Black", "13 5G 256GB - Blue", "Redmi A2 32GB - Sea Green", "Pad 6 128GB - Graphite Gray", "Smart Band 8 - Black"] },
    { brand: "Oppo", prefix: "OPPO", models: ["Reno 11 Pro 5G 256GB - Pearl White", "Reno 10 Pro+ 5G 256GB - Silky Gold", "Reno 10 5G 256GB - Ice Blue", "A79 5G 128GB - Mystery Black", "A58 5G 128GB - Dazzling Green", "F23 Pro 5G 256GB - Cool Black", "Reno 8 T 5G 128GB - Midnight Black", "A78 5G 128GB - Glowing Black", "Reno 7 Pro 5G 256GB - Starry Black", "K11x 128GB - Jade Black"] },
    { brand: "Vivo", prefix: "VIVO", models: ["X100 Pro 256GB - Asteroid Black", "X100 256GB - Starry Blue", "V29 Pro 5G 256GB - Himalayan Blue", "V29 5G 256GB - Peak Blue", "V27 Pro 5G 256GB - Noble Black", "Y36 4G 128GB - Vibrant Gold", "Y56 5G 128GB - Agate Black", "iQOO Z7 Pro 5G 256GB - Blue Lagoon", "iQOO Neo 7 5G 256GB - Interstellar Black", "Y100 5G 128GB - Pacific Blue"] },
    { brand: "Itel", prefix: "ITEL", models: ["S23 Plus 128GB - Starry Black", "P55 5G 128GB - Mystery Black", "A60s 64GB - Shadow Black", "S23 64GB - Dreamy Blue", "P55 4G 64GB - Meadow Purple", "A70 32GB - Gradation Purple", "Vision 51 32GB - Force Black", "A58 32GB - Gradation Green", "P40 32GB - Force Black", "A49 32GB - Force Black"] },
    { brand: "Motorola", prefix: "MOTO", models: ["Edge 50 Pro 256GB - Luxe Lavender", "Edge 40 Neo 5G 256GB - Soothing Sea", "Razr 40 Ultra - Infinite Black", "G84 5G 256GB - Midnight Blue", "Edge 40 5G 256GB - Nebula Green", "G54 5G 128GB - Midnight Blue", "G34 5G 128GB - Ocean Green", "Razr 40 - Sage Green", "G73 5G 128GB - Midnight Blue", "E22 64GB - Mineral Gray"] },
  ];
  const out: MobileProduct[] = [];
  let imgIndex = 0;
  for (const { brand, prefix, models } of brands) {
    for (let i = 0; i < models.length; i++) {
      const name = brand === "Apple" ? `Apple ${models[i]}` : `${brand} ${models[i]}`;
      const sku = `MB-${prefix}-${String(i + 1).padStart(2, "0")}`;
      const mrp = 8000 + Math.floor(Math.random() * 150000);
      const sellingPrice = Math.round(mrp * (0.75 + Math.random() * 0.25));
      const imageUrl = PHONE_IMAGES[imgIndex % PHONE_IMAGES.length];
      imgIndex++;
      out.push({
        name,
        sku,
        mrp,
        sellingPrice: Math.min(sellingPrice, mrp - 1),
        brand,
        rating: Number((3.8 + Math.random() * 1.2).toFixed(1)),
        reviews: 100 + Math.floor(Math.random() * 3000),
        imageUrl,
      });
    }
  }
  return out;
}

const MOBILE_PRODUCTS = buildMobileProducts();

/** Build book products for Fiction, Non-Fiction, Educational. */
function buildBookProducts(): BookProduct[] {
  const titles: { name: string; brand: string; subSlug: string }[] = [
    { name: "The Great Gatsby", brand: "Scribner", subSlug: "fiction" },
    { name: "To Kill a Mockingbird", brand: "Harper Perennial", subSlug: "fiction" },
    { name: "1984", brand: "Penguin", subSlug: "fiction" },
    { name: "Pride and Prejudice", brand: "Penguin Classics", subSlug: "fiction" },
    { name: "The Alchemist", brand: "HarperOne", subSlug: "fiction" },
    { name: "Atomic Habits", brand: "Penguin", subSlug: "nonfiction" },
    { name: "Sapiens", brand: "Harper", subSlug: "nonfiction" },
    { name: "Thinking, Fast and Slow", brand: "Farrar, Straus and Giroux", subSlug: "nonfiction" },
    { name: "The Psychology of Money", brand: "Harriman House", subSlug: "nonfiction" },
    { name: "Deep Work", brand: "Grand Central", subSlug: "nonfiction" },
    { name: "Mathematics Class 10", brand: "NCERT", subSlug: "education" },
    { name: "Physics Class 12", brand: "NCERT", subSlug: "education" },
    { name: "Chemistry Class 11", brand: "NCERT", subSlug: "education" },
    { name: "English Grammar in Use", brand: "Cambridge", subSlug: "education" },
    { name: "Introduction to Algorithms", brand: "MIT Press", subSlug: "education" },
    { name: "Harry Potter and the Philosopher's Stone", brand: "Bloomsbury", subSlug: "fiction" },
    { name: "The Hobbit", brand: "Del Rey", subSlug: "fiction" },
    { name: "Rich Dad Poor Dad", brand: "Plata", subSlug: "nonfiction" },
    { name: "How to Win Friends and Influence People", brand: "Pocket Books", subSlug: "nonfiction" },
    { name: "Biology Class 12", brand: "NCERT", subSlug: "education" },
  ];
  const out: BookProduct[] = [];
  titles.forEach((t, i) => {
    const mrp = 199 + Math.floor(Math.random() * 800);
    const sellingPrice = Math.round(mrp * (0.7 + Math.random() * 0.25));
    out.push({
      name: t.name,
      sku: `BK-${t.subSlug.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(2, "0")}`,
      mrp,
      sellingPrice: Math.min(sellingPrice, mrp - 1),
      brand: t.brand,
      rating: Number((3.9 + Math.random() * 1.1).toFixed(1)),
      reviews: 50 + Math.floor(Math.random() * 500),
      imageUrl: BOOK_IMAGES[i % BOOK_IMAGES.length],
      subSlug: t.subSlug,
    });
  });
  return out;
}

const BOOK_PRODUCTS = buildBookProducts();

/** Build sports products for Fitness, Outdoor, Team Sports, Footwear. */
function buildSportsProducts(): SportsProduct[] {
  const items: { name: string; brand: string; subSlug: string }[] = [
    { name: "Yoga Mat Premium 6mm", brand: "Nike", subSlug: "fitness" },
    { name: "Resistance Bands Set of 5", brand: "Amazon Basics", subSlug: "fitness" },
    { name: "Dumbbells 5kg Pair", brand: "Boldfit", subSlug: "fitness" },
    { name: "Jump Rope Speed", brand: "Cockatoo", subSlug: "fitness" },
    { name: "Foam Roller 33cm", brand: "Reebok", subSlug: "fitness" },
    { name: "Running Treadmill 2HP", brand: "Cockatoo", subSlug: "fitness" },
    { name: "Cycling Helmet", brand: "Vega", subSlug: "outdoor" },
    { name: "Camping Tent 2 Person", brand: "Wildcraft", subSlug: "outdoor" },
    { name: "Trekking Backpack 40L", brand: "Wildcraft", subSlug: "outdoor" },
    { name: "Water Bottle 1L Insulated", brand: "Milton", subSlug: "outdoor" },
    { name: "Football Size 5", brand: "Nivia", subSlug: "team-sports" },
    { name: "Cricket Bat English Willow", brand: "SG", subSlug: "team-sports" },
    { name: "Badminton Racquet Carbon", brand: "Yonex", subSlug: "team-sports" },
    { name: "Basketball Size 7", brand: "Nivia", subSlug: "team-sports" },
    { name: "Volleyball Official", brand: "Nivia", subSlug: "team-sports" },
    { name: "Running Shoes Men", brand: "Nike", subSlug: "footwear" },
    { name: "Running Shoes Women", brand: "Adidas", subSlug: "footwear" },
    { name: "Gym Training Shoes", brand: "Puma", subSlug: "footwear" },
    { name: "Walking Shoes Comfort", brand: "Reebok", subSlug: "footwear" },
    { name: "Sports Sandals", brand: "Sparx", subSlug: "footwear" },
    { name: "Knee Support Brace", brand: "Boldfit", subSlug: "fitness" },
    { name: "Wrist Wraps Lifting", brand: "Cockatoo", subSlug: "fitness" },
    { name: "Table Tennis Bat", brand: "Stag", subSlug: "team-sports" },
    { name: "Cricket Ball Leather", brand: "SG", subSlug: "team-sports" },
    { name: "Hiking Shoes Waterproof", brand: "Quechua", subSlug: "footwear" },
  ];
  const out: SportsProduct[] = [];
  items.forEach((t, i) => {
    const mrp = 499 + Math.floor(Math.random() * 5000);
    const sellingPrice = Math.round(mrp * (0.7 + Math.random() * 0.25));
    out.push({
      name: t.name,
      sku: `SP-${t.subSlug.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(2, "0")}`,
      mrp,
      sellingPrice: Math.min(sellingPrice, mrp - 1),
      brand: t.brand,
      rating: Number((3.8 + Math.random() * 1.2).toFixed(1)),
      reviews: 80 + Math.floor(Math.random() * 800),
      imageUrl: SPORTS_IMAGES[i % SPORTS_IMAGES.length],
      subSlug: t.subSlug,
    });
  });
  return out;
}

const SPORTS_PRODUCTS = buildSportsProducts();

/** Build fashion products for Men's, Women's, Kids. */
function buildFashionProducts(): FashionProduct[] {
  const items: { name: string; brand: string; subSlug: string }[] = [
    { name: "Men's Casual T-Shirt Cotton", brand: "Levi's", subSlug: "mens" },
    { name: "Men's Slim Fit Jeans Blue", brand: "Wrangler", subSlug: "mens" },
    { name: "Men's Formal Shirt White", brand: "Peter England", subSlug: "mens" },
    { name: "Men's Sports Shorts", brand: "Nike", subSlug: "mens" },
    { name: "Men's Winter Jacket", brand: "Monte Carlo", subSlug: "mens" },
    { name: "Women's Floral Summer Dress", brand: "Biba", subSlug: "womens" },
    { name: "Women's High Waist Jeans", brand: "Levi's", subSlug: "womens" },
    { name: "Women's Cotton Kurti", brand: "W", subSlug: "womens" },
    { name: "Women's Running Shoes", brand: "Puma", subSlug: "womens" },
    { name: "Women's Handbag Leather", brand: "H&M", subSlug: "womens" },
    { name: "Kids Boys T-Shirt Pack of 3", brand: "Allen Solly", subSlug: "kids" },
    { name: "Kids Girls Frock", brand: "Lilliput", subSlug: "kids" },
    { name: "Kids Sports Shoes", brand: "Bata", subSlug: "kids" },
    { name: "Kids Denim Jeans", brand: "US Polo Assn", subSlug: "kids" },
    { name: "Kids Winter Sweater", brand: "Mothercare", subSlug: "kids" },
    { name: "Men's Polo Neck T-Shirt", brand: "US Polo Assn", subSlug: "mens" },
    { name: "Women's Saree Silk", brand: "Manyavar", subSlug: "womens" },
    { name: "Kids Ethnic Set", brand: "Fabindia", subSlug: "kids" },
  ];
  const out: FashionProduct[] = [];
  items.forEach((t, i) => {
    const mrp = 499 + Math.floor(Math.random() * 4000);
    const sellingPrice = Math.round(mrp * (0.7 + Math.random() * 0.25));
    out.push({
      name: t.name,
      sku: `FA-${t.subSlug.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(2, "0")}`,
      mrp,
      sellingPrice: Math.min(sellingPrice, mrp - 1),
      brand: t.brand,
      rating: Number((3.7 + Math.random() * 1.3).toFixed(1)),
      reviews: 60 + Math.floor(Math.random() * 600),
      imageUrl: FASHION_IMAGES[i % FASHION_IMAGES.length],
      subSlug: t.subSlug,
    });
  });
  return out;
}

const FASHION_PRODUCTS = buildFashionProducts();

/** Build beauty products for Skincare, Makeup, Haircare. */
function buildBeautyProducts(): BeautyProduct[] {
  const items: { name: string; brand: string; subSlug: string }[] = [
    { name: "Face Moisturizer SPF 30", brand: "Lakmé", subSlug: "skincare" },
    { name: "Vitamin C Serum 20ml", brand: "Minimalist", subSlug: "skincare" },
    { name: "Sunscreen Gel SPF 50", brand: "Neutrogena", subSlug: "skincare" },
    { name: "Face Wash Oil Control", brand: "Himalaya", subSlug: "skincare" },
    { name: "Night Cream Anti-Aging", brand: "Olay", subSlug: "skincare" },
    { name: "Lipstick Matte Red", brand: "Maybelline", subSlug: "makeup" },
    { name: "Kajal Eye Pencil", brand: "Lakmé", subSlug: "makeup" },
    { name: "Compact Powder Natural", brand: "L'Oreal", subSlug: "makeup" },
    { name: "Mascara Volumizing", brand: "Maybelline", subSlug: "makeup" },
    { name: "Blush Pink 5g", brand: "Colorbar", subSlug: "makeup" },
    { name: "Shampoo Anti-Dandruff", brand: "Head & Shoulders", subSlug: "haircare" },
    { name: "Hair Oil Coconut", brand: "Parachute", subSlug: "haircare" },
    { name: "Conditioner Smooth", brand: "Dove", subSlug: "haircare" },
    { name: "Hair Serum Argan", brand: "L'Oreal", subSlug: "haircare" },
    { name: "Hair Mask Repair", brand: "Schwarzkopf", subSlug: "haircare" },
    { name: "Cleansing Balm 100ml", brand: "The Body Shop", subSlug: "skincare" },
    { name: "Foundation Beige 30ml", brand: "MAC", subSlug: "makeup" },
    { name: "Face Pack Clay", brand: "Biotique", subSlug: "skincare" },
  ];
  const out: BeautyProduct[] = [];
  items.forEach((t, i) => {
    const mrp = 199 + Math.floor(Math.random() * 1500);
    const sellingPrice = Math.round(mrp * (0.7 + Math.random() * 0.25));
    out.push({
      name: t.name,
      sku: `BE-${t.subSlug.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(2, "0")}`,
      mrp,
      sellingPrice: Math.min(sellingPrice, mrp - 1),
      brand: t.brand,
      rating: Number((3.8 + Math.random() * 1.2).toFixed(1)),
      reviews: 40 + Math.floor(Math.random() * 400),
      imageUrl: BEAUTY_IMAGES[i % BEAUTY_IMAGES.length],
      subSlug: t.subSlug,
    });
  });
  return out;
}

const BEAUTY_PRODUCTS = buildBeautyProducts();

async function main() {
  const vendorPasswordHash = await bcrypt.hash(VENDOR_PASSWORD, BCRYPT_ROUNDS);
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);
  const customerPasswordHash = await bcrypt.hash(CUSTOMER_PASSWORD, BCRYPT_ROUNDS);

  await prisma.user.upsert({
    where: { email: CUSTOMER_EMAIL },
    update: { passwordHash: customerPasswordHash, firstName: "Demo", lastName: "Customer" },
    create: {
      email: CUSTOMER_EMAIL,
      passwordHash: customerPasswordHash,
      firstName: "Demo",
      lastName: "Customer",
    },
  });

  const superAdminRole = await prisma.adminRole.upsert({
    where: { name: "Super Admin" },
    update: { permissions: SUPER_ADMIN_PERMISSIONS as unknown as object },
    create: {
      name: "Super Admin",
      permissions: SUPER_ADMIN_PERMISSIONS as unknown as object,
      description: "Full access",
    },
  });

  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: adminPasswordHash, name: "Admin Demo" },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      name: "Admin Demo",
    },
  });

  const superAdminPasswordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, BCRYPT_ROUNDS);
  await prisma.admin.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      passwordHash: superAdminPasswordHash,
      name: "Super Admin",
      roleId: superAdminRole.id,
      status: "ACTIVE",
      approvalStatus: "APPROVED",
      isSuperAdmin: true,
    },
    create: {
      email: SUPER_ADMIN_EMAIL,
      passwordHash: superAdminPasswordHash,
      name: "Super Admin",
      roleId: superAdminRole.id,
      status: "ACTIVE",
      approvalStatus: "APPROVED",
      isSuperAdmin: true,
    },
  });

  const seller = await prisma.seller.upsert({
    where: { email: VENDOR_EMAIL },
    update: { passwordHash: vendorPasswordHash, status: "DRAFT" },
    create: {
      email: VENDOR_EMAIL,
      passwordHash: vendorPasswordHash,
      businessName: "Tech Store India",
      ownerName: "Vendor Demo",
      status: "DRAFT",
    },
  });

  let electronicsId: string | undefined;
  let mobilesSubId: string | undefined;
  let booksId: string | undefined;
  let sportsId: string | undefined;
  let fashionId: string | undefined;
  let beautyId: string | undefined;
  let homeId: string | undefined;
  const booksSubIds: Record<string, string> = {};
  const sportsSubIds: Record<string, string> = {};
  const fashionSubIds: Record<string, string> = {};
  const beautySubIds: Record<string, string> = {};
  const homeSubIds: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { slug: cat.slug, name: cat.name, sortOrder: 0 },
    });
    if (cat.slug === "electronics") electronicsId = category.id;
    if (cat.slug === "books") booksId = category.id;
    if (cat.slug === "sports") sportsId = category.id;
    if (cat.slug === "fashion") fashionId = category.id;
    if (cat.slug === "beauty") beautyId = category.id;
    if (cat.slug === "home") homeId = category.id;
    for (const sub of cat.subCategories) {
      const subCat = await prisma.subCategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: sub.slug } },
        update: {},
        create: { categoryId: category.id, slug: sub.slug, name: sub.name, sortOrder: 0 },
      });
      if (cat.slug === "electronics" && sub.slug === "mobiles") mobilesSubId = subCat.id;
      if (cat.slug === "books") booksSubIds[sub.slug] = subCat.id;
      if (cat.slug === "sports") sportsSubIds[sub.slug] = subCat.id;
      if (cat.slug === "fashion") fashionSubIds[sub.slug] = subCat.id;
      if (cat.slug === "beauty") beautySubIds[sub.slug] = subCat.id;
      if (cat.slug === "home") homeSubIds[sub.slug] = subCat.id;
    }
  }

  if (electronicsId && mobilesSubId) {
    for (const p of MOBILE_PRODUCTS) {
      const product = await prisma.product.upsert({
        where: { sellerId_sku: { sellerId: seller.id, sku: p.sku } },
        update: {
          status: "ACTIVE",
          name: p.name,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          avgRating: p.rating,
          reviewCount: p.reviews,
          stock: 50,
        },
        create: {
          sellerId: seller.id,
          categoryId: electronicsId,
          subCategoryId: mobilesSubId,
          name: p.name,
          description: `${p.brand} smartphone.`,
          sku: p.sku,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          stock: 50,
          status: "ACTIVE",
          avgRating: p.rating,
          reviewCount: p.reviews,
        },
      });
      const existingBrand = await prisma.productSpecification.findFirst({
        where: { productId: product.id, key: "Brand" },
      });
      if (existingBrand) {
        await prisma.productSpecification.update({
          where: { id: existingBrand.id },
          data: { value: p.brand },
        });
      } else {
        await prisma.productSpecification.create({
          data: { productId: product.id, key: "Brand", value: p.brand },
        });
      }
      const hasImage = await prisma.productImage.findFirst({
        where: { productId: product.id, deletedAt: null },
      });
      if (!hasImage && p.imageUrl) {
        await prisma.productImage.create({
          data: { productId: product.id, url: p.imageUrl, sortOrder: 0 },
        });
      } else if (hasImage && p.imageUrl) {
        await prisma.productImage.update({
          where: { id: hasImage.id },
          data: { url: p.imageUrl },
        });
      }
    }
  }

  if (booksId && Object.keys(booksSubIds).length > 0) {
    for (const p of BOOK_PRODUCTS) {
      const subId = booksSubIds[p.subSlug] ?? booksSubIds["fiction"];
      const product = await prisma.product.upsert({
        where: { sellerId_sku: { sellerId: seller.id, sku: p.sku } },
        update: {
          status: "ACTIVE",
          name: p.name,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          avgRating: p.rating,
          reviewCount: p.reviews,
          stock: 50,
        },
        create: {
          sellerId: seller.id,
          categoryId: booksId,
          subCategoryId: subId,
          name: p.name,
          description: `Book: ${p.name} by ${p.brand}.`,
          sku: p.sku,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          stock: 50,
          status: "ACTIVE",
          avgRating: p.rating,
          reviewCount: p.reviews,
        },
      });
      const existingBrand = await prisma.productSpecification.findFirst({
        where: { productId: product.id, key: "Brand" },
      });
      if (existingBrand) {
        await prisma.productSpecification.update({
          where: { id: existingBrand.id },
          data: { value: p.brand },
        });
      } else {
        await prisma.productSpecification.create({
          data: { productId: product.id, key: "Brand", value: p.brand },
        });
      }
      const hasImage = await prisma.productImage.findFirst({
        where: { productId: product.id, deletedAt: null },
      });
      if (!hasImage && p.imageUrl) {
        await prisma.productImage.create({
          data: { productId: product.id, url: p.imageUrl, sortOrder: 0 },
        });
      } else if (hasImage && p.imageUrl) {
        await prisma.productImage.update({
          where: { id: hasImage.id },
          data: { url: p.imageUrl },
        });
      }
    }
  }

  if (fashionId && Object.keys(fashionSubIds).length > 0) {
    for (const p of FASHION_PRODUCTS) {
      const subId = fashionSubIds[p.subSlug] ?? fashionSubIds["mens"];
      const product = await prisma.product.upsert({
        where: { sellerId_sku: { sellerId: seller.id, sku: p.sku } },
        update: {
          status: "ACTIVE",
          name: p.name,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          avgRating: p.rating,
          reviewCount: p.reviews,
          stock: 50,
        },
        create: {
          sellerId: seller.id,
          categoryId: fashionId,
          subCategoryId: subId,
          name: p.name,
          description: `Fashion: ${p.name} by ${p.brand}.`,
          sku: p.sku,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          stock: 50,
          status: "ACTIVE",
          avgRating: p.rating,
          reviewCount: p.reviews,
        },
      });
      const existingBrand = await prisma.productSpecification.findFirst({
        where: { productId: product.id, key: "Brand" },
      });
      if (existingBrand) {
        await prisma.productSpecification.update({
          where: { id: existingBrand.id },
          data: { value: p.brand },
        });
      } else {
        await prisma.productSpecification.create({
          data: { productId: product.id, key: "Brand", value: p.brand },
        });
      }
      const hasImage = await prisma.productImage.findFirst({
        where: { productId: product.id, deletedAt: null },
      });
      if (!hasImage && p.imageUrl) {
        await prisma.productImage.create({
          data: { productId: product.id, url: p.imageUrl, sortOrder: 0 },
        });
      } else if (hasImage && p.imageUrl) {
        await prisma.productImage.update({
          where: { id: hasImage.id },
          data: { url: p.imageUrl },
        });
      }
    }
  }

  if (beautyId && Object.keys(beautySubIds).length > 0) {
    for (const p of BEAUTY_PRODUCTS) {
      const subId = beautySubIds[p.subSlug] ?? beautySubIds["skincare"];
      const product = await prisma.product.upsert({
        where: { sellerId_sku: { sellerId: seller.id, sku: p.sku } },
        update: {
          status: "ACTIVE",
          name: p.name,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          avgRating: p.rating,
          reviewCount: p.reviews,
          stock: 50,
        },
        create: {
          sellerId: seller.id,
          categoryId: beautyId,
          subCategoryId: subId,
          name: p.name,
          description: `Beauty: ${p.name} by ${p.brand}.`,
          sku: p.sku,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          stock: 50,
          status: "ACTIVE",
          avgRating: p.rating,
          reviewCount: p.reviews,
        },
      });
      const existingBrand = await prisma.productSpecification.findFirst({
        where: { productId: product.id, key: "Brand" },
      });
      if (existingBrand) {
        await prisma.productSpecification.update({
          where: { id: existingBrand.id },
          data: { value: p.brand },
        });
      } else {
        await prisma.productSpecification.create({
          data: { productId: product.id, key: "Brand", value: p.brand },
        });
      }
      const hasImage = await prisma.productImage.findFirst({
        where: { productId: product.id, deletedAt: null },
      });
      if (!hasImage && p.imageUrl) {
        await prisma.productImage.create({
          data: { productId: product.id, url: p.imageUrl, sortOrder: 0 },
        });
      } else if (hasImage && p.imageUrl) {
        await prisma.productImage.update({
          where: { id: hasImage.id },
          data: { url: p.imageUrl },
        });
      }
    }
  }

  if (homeId && Object.keys(homeSubIds).length > 0) {
    for (const p of HOME_PRODUCTS) {
      const subId = homeSubIds[p.subSlug] ?? homeSubIds["kitchen"];
      const product = await prisma.product.upsert({
        where: { sellerId_sku: { sellerId: seller.id, sku: p.sku } },
        update: {
          status: "ACTIVE",
          name: p.name,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          avgRating: p.rating,
          reviewCount: p.reviews,
          stock: 50,
        },
        create: {
          sellerId: seller.id,
          categoryId: homeId,
          subCategoryId: subId,
          name: p.name,
          description: `Home: ${p.name} by ${p.brand}.`,
          sku: p.sku,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          stock: 50,
          status: "ACTIVE",
          avgRating: p.rating,
          reviewCount: p.reviews,
        },
      });
      const existingBrand = await prisma.productSpecification.findFirst({
        where: { productId: product.id, key: "Brand" },
      });
      if (existingBrand) {
        await prisma.productSpecification.update({
          where: { id: existingBrand.id },
          data: { value: p.brand },
        });
      } else {
        await prisma.productSpecification.create({
          data: { productId: product.id, key: "Brand", value: p.brand },
        });
      }
      const hasImage = await prisma.productImage.findFirst({
        where: { productId: product.id, deletedAt: null },
      });
      if (!hasImage && p.imageUrl) {
        await prisma.productImage.create({
          data: { productId: product.id, url: p.imageUrl, sortOrder: 0 },
        });
      } else if (hasImage && p.imageUrl) {
        await prisma.productImage.update({
          where: { id: hasImage.id },
          data: { url: p.imageUrl },
        });
      }
    }
  }

  if (sportsId && Object.keys(sportsSubIds).length > 0) {
    for (const p of SPORTS_PRODUCTS) {
      const subId = sportsSubIds[p.subSlug] ?? sportsSubIds["fitness"];
      const product = await prisma.product.upsert({
        where: { sellerId_sku: { sellerId: seller.id, sku: p.sku } },
        update: {
          status: "ACTIVE",
          name: p.name,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          avgRating: p.rating,
          reviewCount: p.reviews,
          stock: 50,
        },
        create: {
          sellerId: seller.id,
          categoryId: sportsId,
          subCategoryId: subId,
          name: p.name,
          description: `Sports: ${p.name} by ${p.brand}.`,
          sku: p.sku,
          mrp: p.mrp,
          sellingPrice: p.sellingPrice,
          stock: 50,
          status: "ACTIVE",
          avgRating: p.rating,
          reviewCount: p.reviews,
        },
      });
      const existingBrand = await prisma.productSpecification.findFirst({
        where: { productId: product.id, key: "Brand" },
      });
      if (existingBrand) {
        await prisma.productSpecification.update({
          where: { id: existingBrand.id },
          data: { value: p.brand },
        });
      } else {
        await prisma.productSpecification.create({
          data: { productId: product.id, key: "Brand", value: p.brand },
        });
      }
      const hasImage = await prisma.productImage.findFirst({
        where: { productId: product.id, deletedAt: null },
      });
      if (!hasImage && p.imageUrl) {
        await prisma.productImage.create({
          data: { productId: product.id, url: p.imageUrl, sortOrder: 0 },
        });
      } else if (hasImage && p.imageUrl) {
        await prisma.productImage.update({
          where: { id: hasImage.id },
          data: { url: p.imageUrl },
        });
      }
    }
  }

  console.log("Seed complete.");
  console.log("  Admin:   ", ADMIN_EMAIL, "/", ADMIN_PASSWORD, "→ /admin/login");
  console.log("  Super Admin:", SUPER_ADMIN_EMAIL, "/", SUPER_ADMIN_PASSWORD, "→ /superadmin/login");
  console.log("  Vendor:  ", seller.email, "/ Vendor@123 → /vendor/login");
  console.log("  Customer:", CUSTOMER_EMAIL, "/", CUSTOMER_PASSWORD, "→ /login (for cart)");
  console.log("  Categories: electronics, fashion, home, books, sports, beauty (with sub-categories)");
  if (electronicsId && mobilesSubId) {
    console.log("  Mobiles: ", MOBILE_PRODUCTS.length, "products → /category/mobile-phones");
  }
  if (booksId) {
    console.log("  Books:   ", BOOK_PRODUCTS.length, "products → /category/books");
  }
  if (sportsId) {
    console.log("  Sports:  ", SPORTS_PRODUCTS.length, "products → /category/sports");
  }
  if (fashionId) {
    console.log("  Fashion: ", FASHION_PRODUCTS.length, "products → /category/fashion");
  }
  if (beautyId) {
    console.log("  Beauty:  ", BEAUTY_PRODUCTS.length, "products → /category/beauty");
  }
  if (homeId) {
    console.log("  Home:    ", HOME_PRODUCTS.length, "products → /category/home");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
