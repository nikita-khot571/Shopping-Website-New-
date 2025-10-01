import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const DB_PATH = path.join(__dirname, "../../db.json");

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  users: User[];
  products: Product[];
  cart_items: CartItem[];
  orders: Order[];
  order_items: OrderItem[];
}

function loadDatabase(): Database {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialDb: Database = {
        users: [],
        products: [],
        cart_items: [],
        orders: [],
        order_items: [],
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading database:", error);
    throw error;
  }
}

function saveDatabase(db: Database): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Error saving database:", error);
    throw error;
  }
}

export async function setupDatabase() {
  try {
    console.log("🔄 Setting up JSON database...");
    console.log("📁 Database file:", DB_PATH);

    const db = loadDatabase();

    // Check if we need to seed data
    console.log(`👥 Found ${db.users.length} users in database`);

    if (db.users.length === 0) {
      console.log("🌱 Seeding initial data...");

      // Create admin user
      const adminUser: User = {
        id: uuidv4(),
        email: "admin@shopzone.com",
        password: await bcrypt.hash("admin123", 12),
        firstName: "Admin",
        lastName: "User",
        phone: "+1234567890",
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(adminUser);
      console.log("✅ Admin user created:", adminUser.email);

      // Create sample customer
      const customerUser: User = {
        id: uuidv4(),
        email: "customer@shopzone.com",
        password: await bcrypt.hash("customer123", 12),
        firstName: "John",
        lastName: "Doe",
        phone: "+1987654321",
        role: "customer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(customerUser);
      console.log("✅ Customer user created:", customerUser.email);
    }

    // Seed products if not enough
    console.log(`📦 Found ${db.products.length} products in database`);

    if (db.products.length < 53) {
      console.log("🌱 Seeding products...");

      const products: Omit<Product, "id" | "createdAt" | "updatedAt">[] = [
        // Electronics (11 products)
        {
          name: "iPhone 14 Pro",
          description:
            "Latest Apple smartphone with A16 Bionic chip and Dynamic Island",
          price: 999.99,
          category: "electronics",
          stock: 50,
          image:
            "https://m.media-amazon.com/images/I/61cwywLZR-L._AC_SL1500_.jpg",
        },
        {
          name: "MacBook Air M2",
          description:
            "Apple laptop with M2 chip, 13-inch Liquid Retina display, and all-day battery",
          price: 1199.99,
          category: "electronics",
          stock: 30,
          image:
            "https://m.media-amazon.com/images/I/71qid7QFWJL._AC_SL1500_.jpg",
        },
        {
          name: "Samsung Galaxy S23",
          description:
            "Latest Android smartphone with advanced camera system and 5G connectivity",
          price: 799.99,
          category: "electronics",
          stock: 40,
          image:
            "https://m.media-amazon.com/images/I/61U6oC65TTL._AC_SL1500_.jpg",
        },
        {
          name: "Sony WH-1000XM4",
          description:
            "Premium noise-cancelling wireless headphones with 30-hour battery life",
          price: 199.99,
          category: "electronics",
          stock: 35,
          image:
            "https://m.media-amazon.com/images/I/61D4Z3yKPAL._AC_SL1500_.jpg",
        },
        {
          name: "iPad Pro 12.9-inch",
          description:
            "Powerful tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support",
          price: 1099.99,
          category: "electronics",
          stock: 25,
          image:
            "https://m.media-amazon.com/images/I/81+N4PFF7jS._AC_SL1500_.jpg",
        },
        {
          name: "Dell XPS 13 Laptop",
          description:
            "Ultra-portable laptop with Intel Core i7, 16GB RAM, and stunning InfinityEdge display",
          price: 1299.99,
          category: "electronics",
          stock: 20,
          image:
            "https://m.media-amazon.com/images/I/71UQ8C8YqAL._AC_SL1500_.jpg",
        },
        {
          name: "Apple Watch Series 8",
          description:
            "Advanced smartwatch with health monitoring, GPS, and cellular connectivity",
          price: 399.99,
          category: "electronics",
          stock: 45,
          image:
            "https://m.media-amazon.com/images/I/71wu+HMAKBL._AC_SL1500_.jpg",
        },
        {
          name: "Nintendo Switch OLED",
          description:
            "Handheld gaming console with 7-inch OLED screen, enhanced audio, and 64GB storage",
          price: 349.99,
          category: "electronics",
          stock: 30,
          image:
            "https://m.media-amazon.com/images/I/61-PblYntsL._AC_SL1500_.jpg",
        },
        {
          name: "Google Pixel 7",
          description:
            "Google's latest smartphone with Tensor G2 chip, advanced camera, and pure Android experience",
          price: 599.99,
          category: "electronics",
          stock: 40,
          image:
            "https://m.media-amazon.com/images/I/71E5zB1qbIL._AC_SL1500_.jpg",
        },
        {
          name: "Bose QuietComfort Earbuds",
          description:
            "True wireless earbuds with world-class noise cancellation and 6-hour battery life",
          price: 279.99,
          category: "electronics",
          stock: 50,
          image:
            "https://m.media-amazon.com/images/I/61D4Z3yKPAL._AC_SL1500_.jpg",
        },
        {
          name: "Logitech MX Master 3 Mouse",
          description:
            "Advanced wireless mouse with customizable buttons, ergonomic design, and 70-day battery",
          price: 99.99,
          category: "electronics",
          stock: 60,
          image:
            "https://m.media-amazon.com/images/I/61U6oC65TTL._AC_SL1500_.jpg",
        },

        // Books (8 products)
        {
          name: "The Great Gatsby",
          description:
            "Classic American novel by F. Scott Fitzgerald - A timeless tale of love and tragedy",
          price: 12.99,
          category: "books",
          stock: 100,
          image:
            "https://m.media-amazon.com/images/I/81af+MCrB0L._AC_UY218_.jpg",
        },
        {
          name: "Dune by Frank Herbert",
          description:
            "Epic science fiction masterpiece - The best-selling science fiction novel of all time",
          price: 15.99,
          category: "books",
          stock: 60,
          image: "https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UY218_.jpg",
        },
        {
          name: "To Kill a Mockingbird",
          description:
            "Pulitzer Prize-winning novel by Harper Lee about racial injustice and childhood innocence",
          price: 14.99,
          category: "books",
          stock: 80,
          image:
            "https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UY218_.jpg",
        },
        {
          name: "1984 by George Orwell",
          description:
            "Dystopian social science fiction novel about totalitarian control and surveillance",
          price: 13.99,
          category: "books",
          stock: 70,
          image: "https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UY218_.jpg",
        },
        {
          name: "The Catcher in the Rye",
          description:
            "Coming-of-age novel by J.D. Salinger following teenage rebellion and alienation",
          price: 11.99,
          category: "books",
          stock: 65,
          image:
            "https://m.media-amazon.com/images/I/81OthjkJBuL._AC_UY218_.jpg",
        },
        {
          name: "Pride and Prejudice",
          description:
            "Jane Austen's beloved romance novel about manners, upbringing, morality, and marriage",
          price: 10.99,
          category: "books",
          stock: 90,
          image:
            "https://m.media-amazon.com/images/I/81NLDvyAHrL._AC_UY218_.jpg",
        },
        {
          name: "Harry Potter and the Sorcerer's Stone",
          description:
            "The first book in the Harry Potter series by J.K. Rowling - A magical adventure begins",
          price: 9.99,
          category: "books",
          stock: 120,
          image:
            "https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_UY218_.jpg",
        },
        {
          name: "The Hobbit",
          description:
            "J.R.R. Tolkien's classic fantasy novel - The adventure of Bilbo Baggins",
          price: 13.99,
          category: "books",
          stock: 85,
          image:
            "https://m.media-amazon.com/images/I/91b0C2YNSrL._AC_UY218_.jpg",
        },

        // Clothing (9 products)
        {
          name: "Nike Air Max 270",
          description:
            "Comfortable running shoes with Air Max cushioning and breathable mesh upper",
          price: 129.99,
          category: "clothing",
          stock: 75,
          image:
            "https://m.media-amazon.com/images/I/71VaQ+VnLWL._AC_SL1500_.jpg",
        },
        {
          name: "Levi's 501 Jeans",
          description:
            "Classic straight-fit denim jeans - The original blue jean since 1873",
          price: 59.99,
          category: "clothing",
          stock: 90,
          image:
            "https://m.media-amazon.com/images/I/81f5PF9bfIL._AC_SL1500_.jpg",
        },
        {
          name: "Adidas Ultraboost 22",
          description:
            "High-performance running shoes with Boost technology and responsive cushioning",
          price: 189.99,
          category: "clothing",
          stock: 55,
          image:
            "https://m.media-amazon.com/images/I/81ExJVA4hML._AC_SL1500_.jpg",
        },
        {
          name: "H&M Cotton T-Shirt",
          description:
            "Soft and comfortable basic t-shirt made from 100% organic cotton",
          price: 12.99,
          category: "clothing",
          stock: 120,
          image:
            "https://m.media-amazon.com/images/I/71p4vODhgOL._AC_SL1500_.jpg",
        },
        {
          name: "Zara Wool Coat",
          description:
            "Elegant wool blend coat with classic design and premium fabric quality",
          price: 149.99,
          category: "clothing",
          stock: 35,
          image:
            "https://m.media-amazon.com/images/I/71yZQH8Q8JL._AC_SL1500_.jpg",
        },
        {
          name: "Uniqlo Down Jacket",
          description:
            "Lightweight and warm down jacket with water-resistant finish and packable design",
          price: 79.99,
          category: "clothing",
          stock: 60,
          image:
            "https://m.media-amazon.com/images/I/71r7eWuCsaL._AC_SL1500_.jpg",
        },
        {
          name: "Converse Chuck Taylor",
          description:
            "Iconic high-top sneakers with canvas upper and rubber sole - Timeless style",
          price: 59.99,
          category: "clothing",
          stock: 100,
          image:
            "https://m.media-amazon.com/images/I/71VaQ+VnLWL._AC_SL1500_.jpg",
        },
        {
          name: "Ray-Ban Aviator Sunglasses",
          description:
            "Classic aviator sunglasses with polarized lenses and metal frame",
          price: 149.99,
          category: "clothing",
          stock: 70,
          image:
            "https://m.media-amazon.com/images/I/81f5PF9bfIL._AC_SL1500_.jpg",
        },
        {
          name: "Patagonia Fleece Jacket",
          description:
            "Warm and durable fleece jacket made from recycled polyester",
          price: 119.99,
          category: "clothing",
          stock: 45,
          image:
            "https://m.media-amazon.com/images/I/81ExJVA4hML._AC_SL1500_.jpg",
        },

        // Home (8 products)
        {
          name: "Breville Coffee Maker",
          description:
            "Programmable drip coffee maker with thermal carafe and customizable settings",
          price: 79.99,
          category: "home",
          stock: 40,
          image:
            "https://m.media-amazon.com/images/I/71rG+eBcxtL._AC_SL1500_.jpg",
        },
        {
          name: "LED Desk Lamp",
          description:
            "Adjustable LED desk lamp with USB charging port and touch controls",
          price: 39.99,
          category: "home",
          stock: 45,
          image:
            "https://m.media-amazon.com/images/I/61Vzq3qE7xL._AC_SL1500_.jpg",
        },
        {
          name: "KitchenAid Stand Mixer",
          description:
            "Professional-grade stand mixer with 10 speeds, multiple attachments, and 5-quart bowl",
          price: 379.99,
          category: "home",
          stock: 15,
          image:
            "https://m.media-amazon.com/images/I/81O9VyTxsCL._AC_SL1500_.jpg",
        },
        {
          name: "Dyson Vacuum Cleaner",
          description:
            "Cordless stick vacuum with powerful suction, HEPA filtration, and up to 60 minutes runtime",
          price: 599.99,
          category: "home",
          stock: 20,
          image:
            "https://m.media-amazon.com/images/I/71uVOEHJ6JL._AC_SL1500_.jpg",
        },
        {
          name: "Instant Pot Duo",
          description:
            "7-in-1 electric pressure cooker with sauté, slow cook, rice cooker, steamer, and warmer functions",
          price: 89.99,
          category: "home",
          stock: 50,
          image:
            "https://m.media-amazon.com/images/I/71c2huUeOIL._AC_SL1500_.jpg",
        },
        {
          name: "Casper Memory Foam Mattress",
          description:
            "Premium memory foam mattress with cooling technology and 100-night trial",
          price: 999.99,
          category: "home",
          stock: 10,
          image:
            "https://m.media-amazon.com/images/I/81eB+7+CXL._AC_SL1500_.jpg",
        },
        {
          name: "Nespresso Coffee Machine",
          description:
            "Compact espresso machine with 19 bar pressure and automatic milk frother",
          price: 199.99,
          category: "home",
          stock: 30,
          image:
            "https://m.media-amazon.com/images/I/71rG+eBcxtL._AC_SL1500_.jpg",
        },
        {
          name: "Philips Air Fryer",
          description:
            "Healthy air fryer with rapid air technology and digital touchscreen",
          price: 149.99,
          category: "home",
          stock: 25,
          image:
            "https://m.media-amazon.com/images/I/61Vzq3qE7xL._AC_SL1500_.jpg",
        },

        // Sports (9 products)
        {
          name: "Peloton Bike",
          description:
            "Interactive exercise bike with HD touchscreen, live and on-demand classes",
          price: 2495.00,
          category: "sports",
          stock: 5,
          image:
            "https://m.media-amazon.com/images/I/81f5PF9bfIL._AC_SL1500_.jpg",
        },
        {
          name: "Yoga Mat",
          description:
            "Non-slip yoga mat made from natural rubber with excellent grip and cushioning",
          price: 29.99,
          category: "sports",
          stock: 80,
          image:
            "https://m.media-amazon.com/images/I/71VaQ+VnLWL._AC_SL1500_.jpg",
        },
        {
          name: "Dumbbell Set",
          description:
            "Adjustable dumbbell set with weights from 5-50 lbs, perfect for home workouts",
          price: 199.99,
          category: "sports",
          stock: 25,
          image:
            "https://m.media-amazon.com/images/I/81ExJVA4hML._AC_SL1500_.jpg",
        },
        {
          name: "Tennis Racket",
          description:
            "Professional tennis racket with graphite construction and oversized head for power",
          price: 149.99,
          category: "sports",
          stock: 40,
          image:
            "https://m.media-amazon.com/images/I/71p4vODhgOL._AC_SL1500_.jpg",
        },
        {
          name: "Swimming Goggles",
          description:
            "Anti-fog swimming goggles with UV protection and comfortable silicone seal",
          price: 19.99,
          category: "sports",
          stock: 100,
          image:
            "https://m.media-amazon.com/images/I/71yZQH8Q8JL._AC_SL1500_.jpg",
        },
        {
          name: "Foam Roller",
          description:
            "High-density foam roller for muscle recovery and myofascial release",
          price: 24.99,
          category: "sports",
          stock: 70,
          image:
            "https://m.media-amazon.com/images/I/71r7eWuCsaL._AC_SL1500_.jpg",
        },
        {
          name: "Wilson Basketball",
          description:
            "Official size basketball with composite leather cover and indoor/outdoor use",
          price: 49.99,
          category: "sports",
          stock: 60,
          image:
            "https://m.media-amazon.com/images/I/81f5PF9bfIL._AC_SL1500_.jpg",
        },
        {
          name: "Titleist Golf Clubs Set",
          description:
            "Complete set of golf clubs for beginners with driver, irons, and putter",
          price: 499.99,
          category: "sports",
          stock: 15,
          image:
            "https://m.media-amazon.com/images/I/81ExJVA4hML._AC_SL1500_.jpg",
        },
        {
          name: "Resistance Bands Set",
          description:
            "Set of 5 resistance bands with different strengths for full-body workouts",
          price: 19.99,
          category: "sports",
          stock: 90,
          image:
            "https://m.media-amazon.com/images/I/71p4vODhgOL._AC_SL1500_.jpg",
        },

        // Toys (8 products)
        {
          name: "LEGO Creator Set",
          description:
            "Creative building set with 3-in-1 model designs and step-by-step instructions",
          price: 49.99,
          category: "toys",
          stock: 60,
          image:
            "https://m.media-amazon.com/images/I/81O9VyTxsCL._AC_SL1500_.jpg",
        },
        {
          name: "Barbie Dreamhouse",
          description:
            "Dollhouse with elevator, pool, and multiple rooms for endless imaginative play",
          price: 199.99,
          category: "toys",
          stock: 15,
          image:
            "https://m.media-amazon.com/images/I/71uVOEHJ6JL._AC_SL1500_.jpg",
        },
        {
          name: "Hot Wheels Track",
          description:
            "Expandable racetrack set with loops, jumps, and stunt features for racing fun",
          price: 39.99,
          category: "toys",
          stock: 45,
          image:
            "https://m.media-amazon.com/images/I/71c2huUeOIL._AC_SL1500_.jpg",
        },
        {
          name: "Puzzle 1000 Pieces",
          description:
            "Challenging jigsaw puzzle with beautiful landscape scene and sturdy pieces",
          price: 14.99,
          category: "toys",
          stock: 85,
          image:
            "https://m.media-amazon.com/images/I/81eB+7+CXL._AC_SL1500_.jpg",
        },
        {
          name: "Remote Control Car",
          description:
            "High-speed RC car with rechargeable battery and 2.4GHz remote control",
          price: 59.99,
          category: "toys",
          stock: 30,
          image:
            "https://m.media-amazon.com/images/I/81f5PF9bfIL._AC_SL1500_.jpg",
        },
        {
          name: "Board Game - Monopoly",
          description:
            "Classic property trading board game for the whole family with modern updates",
          price: 24.99,
          category: "toys",
          stock: 50,
          image:
            "https://m.media-amazon.com/images/I/81ExJVA4hML._AC_SL1500_.jpg",
        },
        {
          name: "Nerf N-Strike Blaster",
          description:
            "Powerful foam dart blaster with 12-dart drum and motorized firing",
          price: 29.99,
          category: "toys",
          stock: 70,
          image:
            "https://m.media-amazon.com/images/I/81O9VyTxsCL._AC_SL1500_.jpg",
        },
        {
          name: "Play-Doh Modeling Compound",
          description:
            "Classic modeling compound in assorted colors for creative play",
          price: 4.99,
          category: "toys",
          stock: 150,
          image:
            "https://m.media-amazon.com/images/I/71uVOEHJ6JL._AC_SL1500_.jpg",
        },
      ];

      for (const product of products) {
        const newProduct: Product = {
          id: uuidv4(),
          ...product,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.products.push(newProduct);
      }

      saveDatabase(db);
      console.log(`✅ Created ${products.length} sample products`);
      console.log("✅ Initial data seeding completed");
    }

    console.log("✅ Database setup complete");
    console.log(`📊 Database statistics:`);
    console.log(`   Users: ${db.users.length}`);
    console.log(`   Products: ${db.products.length}`);
    console.log(`   Cart Items: ${db.cart_items.length}`);
    console.log(`   Orders: ${db.orders.length}`);
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  }
}

// Export database functions
export function getDatabase(): Database {
  return loadDatabase();
}

export function saveToDatabase(db: Database): void {
  saveDatabase(db);
}

// If this file is run directly, setup the database
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("✅ Database setup completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Database setup failed:", error);
      process.exit(1);
    });
}
