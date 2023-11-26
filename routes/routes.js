const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../db");

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const checkUserSql = "SELECT * FROM users WHERE username = ?";
  const [existingUser] = await db.promise().query(checkUserSql, [username]);

  if (existingUser.length > 0) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertUserSql = "INSERT INTO users (username, password) VALUES (?, ?)";
  await db.promise().query(insertUserSql, [username, hashedPassword]);

  console.log("User registered successfully");

  res.status(201).json({ message: "User registered successfully" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const getUserSql = "SELECT * FROM users WHERE username = ?";
  const [user] = await db.promise().query(getUserSql, [username]);

  if (user.length === 0) {
    return res
      .status(401)
      .json({ error: "Authentication failed. User not found." });
  }

  const isPasswordValid = await bcrypt.compare(password, user[0].password);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ error: "Authentication failed. Incorrect password." });
  }

  const token = jwt.sign(
    { userId: user[0].id, username: user[0].username },
    "SecretKey",
    {
      expiresIn: "1h",
    }
  );

  res.cookie("authToken", token, { httpOnly: true });

  res.send("Login successful!");
});

router.post("/products", async (req, res) => {
  const { productName, productPrice, category, productDescription } = req.body;

  try {
    // Checking
    const [categoryResult] = await db
      .promise()
      .query("SELECT category_id FROM categories WHERE category_name = ?", [
        category,
      ]);

    if (categoryResult.length === 0) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const insertProductSql = `
        INSERT INTO products (product_name, category_id, price, description)
        VALUES (?, ?, ?, ?)
    `;
    await db
      .promise()
      .query(insertProductSql, [
        productName,
        categoryResult[0].category_id,
        productPrice,
        productDescription,
      ]);

    console.log("Product created successfully");
    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    console.error("Error during product creation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const productsSql = `
      SELECT products.product_id, products.product_name, categories.category_name, products.price, products.description
      FROM products
      JOIN categories ON products.category_id = categories.category_id
    `;
    const [products] = await db.promise().query(productsSql);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching product list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    // Checking
    const [productResult] = await db
      .promise()
      .query("SELECT * FROM products WHERE product_id = ?", [productId]);

    if (productResult.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    await db
      .promise()
      .query("DELETE FROM products WHERE product_id = ?", [productId]);

    console.log("Product deleted successfully");
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error during product deletion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
