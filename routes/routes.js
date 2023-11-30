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
  const [result] = await db
    .promise()
    .query(insertUserSql, [username, hashedPassword]);

  const userId = result.insertId; // Get the ID of the newly inserted user

  const token = jwt.sign({ userId, username }, "SecretKey", {
    expiresIn: "2h",
  });

  res.cookie("authToken", token, { httpOnly: true });

  console.log("User registered successfully");

  res.json({
    message: "User registered successfully",
    userId,
    token,
  });
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
      expiresIn: "2h",
    }
  );

  res.cookie("authToken", token, { httpOnly: true });

  res.json({ message: "Login successful!", userId: user[0].id });
});

router.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.json({ message: "Logout successful" });
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

router.get("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const [productResult] = await db
      .promise()
      .query("SELECT * FROM products WHERE product_id = ?", [productId]);

    if (productResult.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(productResult[0]);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const { productName, productPrice, category, productDescription } = req.body;

  try {
    // Checking
    const [productResult] = await db
      .promise()
      .query("SELECT * FROM products WHERE product_id = ?", [productId]);

    if (productResult.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const [categoryResult] = await db
      .promise()
      .query("SELECT category_id FROM categories WHERE category_name = ?", [
        category,
      ]);

    if (categoryResult.length === 0) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const updateProductSql = `
      UPDATE products
      SET product_name = ?, category_id = ?, price = ?, description = ?
      WHERE product_id = ?
    `;
    await db
      .promise()
      .query(updateProductSql, [
        productName,
        categoryResult[0].category_id,
        productPrice,
        productDescription,
        productId,
      ]);

    console.log("Product updated successfully");
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error during product update:", error);
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

router.post("/categories", async (req, res) => {
  const { categoryName } = req.body;

  try {
    const insertCategorySql =
      "INSERT INTO categories (category_name) VALUES (?)";
    await db.promise().query(insertCategorySql, [categoryName]);

    console.log("Category created successfully");
    res.status(201).json({ message: "Category created successfully" });
  } catch (error) {
    console.error("Error during category creation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categoriesSql = "SELECT * FROM categories";
    const [categories] = await db.promise().query(categoriesSql);

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching category list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  const categoryId = req.params.id;

  try {
    // Checking
    const [categoryResult] = await db
      .promise()
      .query("SELECT * FROM categories WHERE category_id = ?", [categoryId]);

    if (categoryResult.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    await db
      .promise()
      .query("DELETE FROM categories WHERE category_id = ?", [categoryId]);

    console.log("Category deleted successfully");
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error during category deletion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/categories/:id", async (req, res) => {
  const categoryId = req.params.id;
  const { categoryName } = req.body;

  try {
    const [categoryResult] = await db
      .promise()
      .query("SELECT * FROM categories WHERE category_id = ?", [categoryId]);

    if (categoryResult.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const updateCategorySql =
      "UPDATE categories SET category_name = ? WHERE category_id = ?";
    await db.promise().query(updateCategorySql, [categoryName, categoryId]);

    console.log("Category updated successfully");
    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("Error during category update:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories/:id", async (req, res) => {
  const categoryId = req.params.id;

  try {
    const [categoryResult] = await db
      .promise()
      .query("SELECT * FROM categories WHERE category_id = ?", [categoryId]);

    if (categoryResult.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(categoryResult[0]);
  } catch (error) {
    console.error("Error fetching category details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cart", async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
    if (!user_id || !product_id || !quantity) {
      return res
        .status(400)
        .json({ error: "User ID, product ID, and quantity are required" });
    }

    const [productResult] = await db
      .promise()
      .query("SELECT * FROM products WHERE product_id = ?", [product_id]);

    if (productResult.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const [userResult] = await db
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [user_id]);

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const insertCartSql = `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES (?, ?, ?)
    `;
    await db.promise().query(insertCartSql, [user_id, product_id, quantity]);

    console.log("Product added to cart successfully");
    res.status(201).json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding product to cart:", error);

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res
        .status(500)
        .json({ error: "Foreign key constraint violation" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/cart/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const cartItemsSql = `
      SELECT cart.cart_id, cart.user_id, cart.product_id, cart.quantity, cart.created_at, cart.updated_at, products.product_name, products.price
      FROM cart
      INNER JOIN products ON cart.product_id = products.product_id
      WHERE cart.user_id = ?
    `;
    const [cartItems] = await db.promise().query(cartItemsSql, [userId]);

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/cart/:cartId", async (req, res) => {
  const cartId = req.params.cartId;
  const { quantity } = req.body;

  try {
    const [cartItemResult] = await db
      .promise()
      .query("SELECT * FROM cart WHERE cart_id = ?", [cartId]);

    if (cartItemResult.length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const updateCartItemSql = `
      UPDATE cart
      SET quantity = ?
      WHERE cart_id = ?
    `;
    await db.promise().query(updateCartItemSql, [quantity, cartId]);

    console.log("Cart item quantity updated successfully");
    res
      .status(200)
      .json({ message: "Cart item quantity updated successfully" });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cart/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log(`Deleting cart items for user with ID ${userId}`);

  try {
    const deleteCartItemsSql = `
      DELETE FROM cart
      WHERE user_id = ?
    `;

    const [result] = await db.promise().query(deleteCartItemsSql, [userId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Cart cleared successfully" });
    } else {
      res.status(404).json({ error: "Cart not found or already cleared" });
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  const { user_id, product_details, total_price, shipping_address } = req.body;

  try {
    const [userResult] = await db
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [user_id]);

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const insertOrderSql = `
      INSERT INTO orders (user_id, total_price, shipping_address, order_date, order_status)
      VALUES (?, ?, ?, NOW(), 'pending')
    `;
    const [orderResult] = await db
      .promise()
      .query(insertOrderSql, [user_id, total_price, shipping_address]);

    const orderId = orderResult.insertId;

    const insertOrderDetailsSql = `
      INSERT INTO order_details (order_id, product_id, quantity)
      VALUES (?, ?, ?)
    `;
    for (const product of product_details) {
      await db
        .promise()
        .query(insertOrderDetailsSql, [
          orderId,
          product.product_id,
          product.quantity,
        ]);
    }

    const deleteCartItemsSql = `
      DELETE FROM cart
      WHERE user_id = ?
    `;
    await db.promise().query(deleteCartItemsSql, [user_id]);

    console.log("Order placed successfully");

    res
      .status(201)
      .json({ message: "Order placed successfully", order_id: orderId });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const userOrdersSql = `
      SELECT orders.*, order_details.*, products.product_name
      FROM orders
      INNER JOIN order_details ON orders.order_id = order_details.order_id
      INNER JOIN products ON order_details.product_id = products.product_id
      WHERE orders.user_id = ?
    `;
    const [userOrders] = await db.promise().query(userOrdersSql, [userId]);

    const ordersWithDetails = userOrders.reduce((accumulator, order) => {
      const existingOrder = accumulator.find(
        (item) => item.order_id === order.order_id
      );
      if (existingOrder) {
        existingOrder.order_details.push({
          detail_id: order.detail_id,
          product_id: order.product_id,
          product_name: order.product_name,
          quantity: order.quantity,
        });
      } else {
        accumulator.push({
          order_id: order.order_id,
          user_id: order.user_id,
          total_price: order.total_price,
          shipping_address: order.shipping_address,
          order_date: order.order_date,
          order_status: order.order_status,
          order_details: [
            {
              detail_id: order.detail_id,
              product_id: order.product_id,
              product_name: order.product_name,
              quantity: order.quantity,
            },
          ],
        });
      }
      return accumulator;
    }, []);

    res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/orders/:orderId", async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const cancelOrderSql = "DELETE FROM orders WHERE order_id = ?";
    const [result] = await db.promise().query(cancelOrderSql, [orderId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Order canceled successfully" });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
