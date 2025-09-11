// src/index.ts
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// ---------------- Types
type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
};

// ---------------- Data helpers (file in project root: /data/products.json)
const dataPath = path.join(process.cwd(), "data", "products.json");

function ensureDataFile() {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "[]", "utf8");
}

const load = (): Product[] => {
  ensureDataFile();
  const text = fs.readFileSync(dataPath, "utf8");
  try {
    return JSON.parse(text) as Product[];
  } catch {
    fs.writeFileSync(dataPath, "[]", "utf8");
    return [];
  }
};

const save = (arr: Product[]): void => {
  ensureDataFile();
  fs.writeFileSync(dataPath, JSON.stringify(arr, null, 2), "utf8");
};

// ---------------- GraphQL schema & resolvers
const typeDefs = `
  type Product {
    id: Int!
    name: String!
    price: Float!
    description: String
  }

  type Query {
    products: [Product!]!
    product(id: Int!): Product
  }

  type Mutation {
    addProduct(name: String!, price: Float!, description: String): Product!
  }
`;

const resolvers = {
  Query: {
    products: (): Product[] => load(),
    product: (_: unknown, args: { id: number }): Product | null =>
      load().find((p) => p.id === args.id) ?? null,
  },
  Mutation: {
    addProduct: (_: unknown, args: { name: string; price: number; description?: string }): Product => {
      const products = load();
      const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const newProduct: Product = {
        id: nextId,
        name: args.name,
        price: args.price,
        description: args.description,
      };
      products.push(newProduct);
      save(products);
      return newProduct;
    },
  },
};

// ---------------- Start Apollo GraphQL (port 4000)
async function start() {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
  console.log(`🚀 GraphQL server ready at ${url}`);

  // ---------------- Express to serve frontend (port 3000)
  const app = express();
  app.use(cors());
  app.use(express.static(path.join(process.cwd(), "public")));

  app.listen(3000, () => {
    console.log("🛒 Frontend ready at http://localhost:3000");
  });
}

start().catch((err) => {
  console.error("Failed to start servers:", err);
  process.exit(1);
});
