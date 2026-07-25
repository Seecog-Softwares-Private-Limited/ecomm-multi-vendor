/**
 * Canonical marketplace category tree — used by seed and category upsert scripts.
 */
export type MarketplaceCategorySeed = {
  slug: string;
  name: string;
  sortOrder: number;
  subCategories: { slug: string; name: string; sortOrder?: number }[];
};

export const MARKETPLACE_CATEGORIES: MarketplaceCategorySeed[] = [
  {
    slug: "electronics",
    name: "Electronics",
    sortOrder: 1,
    subCategories: [
      { slug: "mobiles", name: "Mobile Phones" },
      { slug: "laptops", name: "Laptops & Computers" },
      { slug: "tv-audio", name: "TV & Audio" },
      { slug: "accessories", name: "Electronics Accessories" },
    ],
  },
  {
    slug: "fashion",
    name: "Fashion",
    sortOrder: 2,
    subCategories: [
      { slug: "mens", name: "Men's Clothing" },
      { slug: "womens", name: "Women's Clothing" },
      { slug: "kids", name: "Kids Wear" },
      { slug: "ethnic", name: "Ethnic Wear" },
    ],
  },
  {
    slug: "footwear",
    name: "Footwear",
    sortOrder: 3,
    subCategories: [
      { slug: "mens-shoes", name: "Men's Footwear" },
      { slug: "womens-shoes", name: "Women's Footwear" },
      { slug: "sports-shoes", name: "Sports Shoes" },
      { slug: "sandals", name: "Sandals & Flip Flops" },
    ],
  },
  {
    slug: "beauty",
    name: "Beauty & Personal Care",
    sortOrder: 4,
    subCategories: [
      { slug: "skincare", name: "Skincare" },
      { slug: "makeup", name: "Makeup" },
      { slug: "haircare", name: "Haircare" },
      { slug: "fragrance", name: "Fragrance" },
    ],
  },
  {
    slug: "home",
    name: "Home & Kitchen",
    sortOrder: 5,
    subCategories: [
      { slug: "kitchen", name: "Kitchen & Dining" },
      { slug: "decor", name: "Home Decor" },
      { slug: "storage", name: "Storage & Organization" },
      { slug: "bedding", name: "Bedding & Bath" },
    ],
  },
  {
    slug: "appliances",
    name: "Appliances",
    sortOrder: 6,
    subCategories: [
      { slug: "large-appliances", name: "Large Appliances" },
      { slug: "small-appliances", name: "Small Appliances" },
      { slug: "kitchen-appliances", name: "Kitchen Appliances" },
      { slug: "cooling-heating", name: "Cooling & Heating" },
    ],
  },
  {
    slug: "furniture",
    name: "Furniture",
    sortOrder: 7,
    subCategories: [
      { slug: "living-room", name: "Living Room" },
      { slug: "bedroom", name: "Bedroom" },
      { slug: "office-furniture", name: "Office Furniture" },
      { slug: "outdoor-furniture", name: "Outdoor Furniture" },
    ],
  },
  {
    slug: "grocery",
    name: "Grocery & Gourmet",
    sortOrder: 8,
    subCategories: [
      { slug: "staples", name: "Staples & Cooking Essentials" },
      { slug: "snacks", name: "Snacks & Beverages" },
      { slug: "organic", name: "Organic & Health Foods" },
      { slug: "spices", name: "Spices & Masalas" },
    ],
  },
  {
    slug: "health",
    name: "Health & Wellness",
    sortOrder: 9,
    subCategories: [
      { slug: "vitamins", name: "Vitamins & Supplements" },
      { slug: "personal-care", name: "Personal Care" },
      { slug: "medical-supplies", name: "Medical Supplies" },
      { slug: "ayurveda", name: "Ayurveda & Herbal" },
    ],
  },
  {
    slug: "sports",
    name: "Sports & Fitness",
    sortOrder: 10,
    subCategories: [
      { slug: "fitness", name: "Fitness Equipment" },
      { slug: "outdoor", name: "Outdoor Sports" },
      { slug: "team-sports", name: "Team Sports" },
      { slug: "sportswear", name: "Sportswear" },
    ],
  },
  {
    slug: "toys",
    name: "Toys & Baby",
    sortOrder: 11,
    subCategories: [
      { slug: "toys-games", name: "Toys & Games" },
      { slug: "baby-care", name: "Baby Care" },
      { slug: "baby-clothing", name: "Baby Clothing" },
      { slug: "school-supplies", name: "School Supplies" },
    ],
  },
  {
    slug: "books",
    name: "Books & Media",
    sortOrder: 12,
    subCategories: [
      { slug: "fiction", name: "Fiction" },
      { slug: "nonfiction", name: "Non-Fiction" },
      { slug: "education", name: "Educational & Exam Prep" },
      { slug: "children-books", name: "Children's Books" },
    ],
  },
  {
    slug: "automotive",
    name: "Automotive",
    sortOrder: 13,
    subCategories: [
      { slug: "car-accessories", name: "Car Accessories" },
      { slug: "bike-accessories", name: "Bike Accessories" },
      { slug: "helmets", name: "Helmets & Riding Gear" },
      { slug: "car-care", name: "Car Care & Cleaning" },
    ],
  },
  {
    slug: "watches",
    name: "Watches & Accessories",
    sortOrder: 14,
    subCategories: [
      { slug: "mens-watches", name: "Men's Watches" },
      { slug: "womens-watches", name: "Women's Watches" },
      { slug: "smart-watches", name: "Smart Watches" },
      { slug: "watch-accessories", name: "Watch Accessories" },
    ],
  },
  {
    slug: "jewelry",
    name: "Jewelry",
    sortOrder: 15,
    subCategories: [
      { slug: "gold-jewelry", name: "Gold Jewelry" },
      { slug: "silver-jewelry", name: "Silver Jewelry" },
      { slug: "fashion-jewelry", name: "Fashion Jewelry" },
      { slug: "coins-bars", name: "Coins & Bars" },
    ],
  },
  {
    slug: "bags",
    name: "Bags & Luggage",
    sortOrder: 16,
    subCategories: [
      { slug: "backpacks", name: "Backpacks" },
      { slug: "handbags", name: "Handbags & Clutches" },
      { slug: "travel-luggage", name: "Travel Luggage" },
      { slug: "wallet-belts", name: "Wallets & Belts" },
    ],
  },
  {
    slug: "office",
    name: "Office & Stationery",
    sortOrder: 17,
    subCategories: [
      { slug: "stationery", name: "Stationery" },
      { slug: "office-supplies", name: "Office Supplies" },
      { slug: "art-craft", name: "Art & Craft" },
      { slug: "calculators", name: "Calculators & Tools" },
    ],
  },
  {
    slug: "pet-supplies",
    name: "Pet Supplies",
    sortOrder: 18,
    subCategories: [
      { slug: "dog", name: "Dog Supplies" },
      { slug: "cat", name: "Cat Supplies" },
      { slug: "bird-fish", name: "Bird & Fish" },
      { slug: "pet-grooming", name: "Pet Grooming" },
    ],
  },
  {
    slug: "garden",
    name: "Garden & Outdoors",
    sortOrder: 19,
    subCategories: [
      { slug: "gardening", name: "Gardening" },
      { slug: "outdoor-living", name: "Outdoor Living" },
      { slug: "tools-hardware", name: "Tools & Hardware" },
      { slug: "pest-control", name: "Pest Control" },
    ],
  },
  {
    slug: "industrial",
    name: "Industrial & Tools",
    sortOrder: 20,
    subCategories: [
      { slug: "power-tools", name: "Power Tools" },
      { slug: "hand-tools", name: "Hand Tools" },
      { slug: "safety-equipment", name: "Safety Equipment" },
      { slug: "electrical", name: "Electrical Supplies" },
    ],
  },
];
