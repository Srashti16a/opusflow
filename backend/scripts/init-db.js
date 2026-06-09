const { Client } = require("pg");
require("dotenv").config();

async function initDb() {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: "postgres"
  });

  try {
    await client.connect();
    console.log("Connected to default postgres database to check target database...");

    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (res.rows.length === 0) {
      console.log(`Database '${process.env.DB_NAME}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`Database '${process.env.DB_NAME}' created successfully.`);
    } else {
      console.log(`Database '${process.env.DB_NAME}' already exists.`);
    }
  } catch (err) {
    console.error("Error checking or creating database:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDb();
