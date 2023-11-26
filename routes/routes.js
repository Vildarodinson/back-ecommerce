// routes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
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

module.exports = router;
