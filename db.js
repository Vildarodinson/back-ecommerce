const { Pool } = require("pg");

const pool = new Pool({
  user: "andrew",
  host: "warm-nutria-1579.g8x.cockroachlabs.cloud",
  database: "ecommerce",
  password: "Hj132VSu8h51RxeXzL22qQ",
  port: 26257,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
