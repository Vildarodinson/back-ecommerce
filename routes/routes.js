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
    "yourSecretKey",
    {
      expiresIn: "1h",
    }
  );

  res.cookie("authToken", token, { httpOnly: true });

  res.send("Login successful!");
});

module.exports = router;
