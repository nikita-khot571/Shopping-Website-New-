import { Client } from "pg"; // or mysql2 depending on DB

async function migrate() {
  const client = new Client({
    user: "root",
    password: "password",
    database: "shopping_db",
  });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255)
    );
  `);

  await client.end();
  console.log("Migration complete 🚀");
}

migrate().catch(err => console.error(err));
