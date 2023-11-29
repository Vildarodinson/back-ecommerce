const mysql = require("mysql2");
const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: process.env.COCKROACH_DB_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

module.exports = db;
