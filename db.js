const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "ecommerce",
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
