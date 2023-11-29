const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_DATABASE || "ecommerce",
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://andrew:Hj132VSu8h51RxeXzL22qQ@warm-nutria-1579.g8x.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

module.exports = db;
