"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
async function migrate() {
    const client = new pg_1.Client({
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
//# sourceMappingURL=migrate.js.map