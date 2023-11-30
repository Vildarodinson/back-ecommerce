const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../db");

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  let result;

  try {
    console.log("Received registration request:", { username, password });

    const checkUserSql = "SELECT * FROM users WHERE username = $1";
    result = await db.query(checkUserSql, [username]);

    const existingUser = result.rows;

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Hashed password:", hashedPassword);

    const insertUserSql =
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id";
    result = await db.query(insertUserSql, [username, hashedPassword]);

    const userId = result.rows[0].id;

    console.log("User registered successfully");

    const token = jwt.sign({ userId, username }, "SecretKey", {
      expiresIn: "2h",
    });

    res.cookie("authToken", token, { httpOnly: true });

    res.json({
      message: "User registered successfully",
      userId,
      token,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const getUserSql = "SELECT * FROM users WHERE username = $1";
    const { rows: user } = await db.query(getUserSql, [username]);

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
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.json({ message: "Logout successful" });
});

router.post("/products", async (req, res) => {
  const { productName, productPrice, category, productDescription } = req.body;

  try {
    // Checking
    const categoryResult = await db.query(
      "SELECT category_id FROM categories WHERE category_name = $1",
      [category]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const insertProductSql = `
        INSERT INTO products (product_name, category_id, price, description)
        VALUES ($1, $2, $3, $4)
    `;
    await db.query(insertProductSql, [
      productName,
      categoryResult.rows[0].category_id,
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
    const { rows: products } = await db.query(productsSql);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching product list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const productResult = await db.query(
      "SELECT * FROM products WHERE product_id = $1",
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(productResult.rows[0]);
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
    const productResult = await db.query(
      "SELECT * FROM products WHERE product_id = $1",
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const categoryResult = await db.query(
      "SELECT category_id FROM categories WHERE category_name = $1",
      [category]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const updateProductSql = `
      UPDATE products
      SET product_name = $1, category_id = $2, price = $3, description = $4
      WHERE product_id = $5
    `;
    await db.query(updateProductSql, [
      productName,
      categoryResult.rows[0].category_id,
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
    const productResult = await db.query(
      "SELECT * FROM products WHERE product_id = $1",
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    await db.query("DELETE FROM products WHERE product_id = $1", [productId]);

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
      "INSERT INTO categories (category_name) VALUES ($1)";
    await db.query(insertCategorySql, [categoryName]);

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
    const { rows: categories } = await db.query(categoriesSql);

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
    const { rows: categoryResult } = await db.query(
      "SELECT * FROM categories WHERE category_id = $1",
      [categoryId]
    );

    if (categoryResult.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    await db.query("DELETE FROM categories WHERE category_id = $1", [
      categoryId,
    ]);

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
    const { rows: categoryResult } = await db.query(
      "SELECT * FROM categories WHERE category_id = $1",
      [categoryId]
    );

    if (categoryResult.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const updateCategorySql =
      "UPDATE categories SET category_name = $1 WHERE category_id = $2";
    await db.query(updateCategorySql, [categoryName, categoryId]);

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
    const { rows: categoryResult } = await db.query(
      "SELECT * FROM categories WHERE category_id = $1",
      [categoryId]
    );

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

    const productResult = await db.query(
      "SELECT * FROM products WHERE product_id = $1",
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const userResult = await db.query("SELECT * FROM users WHERE id = $1", [
      user_id,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Start a transaction
    await db.query("BEGIN");

    const insertCartSql = `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
    `;

    await db.query(insertCartSql, [user_id, product_id, quantity]);

    // Commit the transaction
    await db.query("COMMIT");

    console.log("Product added to cart successfully");
    res.status(201).json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding product to cart:", error);

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res
        .status(500)
        .json({ error: "Foreign key constraint violation" });
    }

    // Rollback the transaction in case of an error
    await db.query("ROLLBACK");

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
      WHERE cart.user_id = $1
    `;
    const { rows: cartItems } = await db.query(cartItemsSql, [userId]);

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
    const { rows: cartItemResult } = await db.query(
      "SELECT * FROM cart WHERE cart_id = $1",
      [cartId]
    );

    if (cartItemResult.length === 0) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const updateCartItemSql = `
      UPDATE cart
      SET quantity = $1
      WHERE cart_id = $2
    `;
    await db.query(updateCartItemSql, [quantity, cartId]);

    console.log("Cart item quantity updated successfully");
    res
      .status(200)
      .json({ message: "Cart item quantity updated successfully" });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/cart/:cartId", async (req, res) => {
  const cartId = req.params.cartId;
  console.log(`Deleting cart item with ID ${cartId}`);

  try {
    const deleteCartItemsSql = `
      DELETE FROM cart
      WHERE cart_id = $1
    `;

    const [result] = await db.query(deleteCartItemsSql, [cartId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Cart item deleted successfully" });
    } else {
      res.status(404).json({ error: "Cart item not found" });
    }
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  const { user_id, product_details, total_price, shipping_address } = req.body;

  try {
    const { rows: userResult } = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [user_id]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const insertOrderSql = `
      INSERT INTO orders (user_id, total_price, shipping_address, order_date, order_status)
      VALUES ($1, $2, $3, NOW(), 'pending')
      RETURNING order_id
    `;
    const { rows: orderResult } = await db.query(insertOrderSql, [
      user_id,
      total_price,
      shipping_address,
    ]);

    const orderId = orderResult[0].order_id;

    const insertOrderDetailsSql = `
      INSERT INTO order_details (order_id, product_id, quantity)
      VALUES ($1, $2, $3)
    `;
    for (const product of product_details) {
      await db.query(insertOrderDetailsSql, [
        orderId,
        product.product_id,
        product.quantity,
      ]);
    }

    const deleteCartItemsSql = `
      DELETE FROM cart
      WHERE user_id = $1
    `;
    await db.query(deleteCartItemsSql, [user_id]);

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
      SELECT orders.order_id, orders.user_id, orders.total_price, orders.shipping_address, orders.order_date, orders.order_status, 
             order_details.detail_id, order_details.product_id, products.product_name, order_details.quantity
      FROM orders
      INNER JOIN order_details ON orders.order_id = order_details.order_id
      INNER JOIN products ON order_details.product_id = products.product_id
      WHERE orders.user_id = $1
    `;
    const { rows: userOrders } = await db.query(userOrdersSql, [userId]);

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
    const cancelOrderSql = "DELETE FROM orders WHERE order_id = $1";
    const { rowCount } = await db.query(cancelOrderSql, [orderId]);

    if (rowCount > 0) {
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
