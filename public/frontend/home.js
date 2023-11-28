import {
  addToCart,
  getCookie,
  getCartItems,
  deleteCartItem,
  CartItemAndRender,
  updateCartItemQuantity,
} from "./cart.js";

document.addEventListener("DOMContentLoaded", async function () {
  const productForm = document.getElementById("productForm");
  const productList = document.getElementById("productList");
  const categoryForm = document.getElementById("categoryForm");
  const categoryList = document.getElementById("categoryList");
  const categorySelect = document.getElementById("category");

  const updateProductForm = document.getElementById("updateProductForm");
  const updateCategorySelect = document.getElementById("updateCategory");
  const updateProductBtn = document.getElementById("updateProductBtn");

  const updateCategoryForm = document.getElementById("updateCategoryForm");
  const updateCategoryBtn = document.getElementById("updateCategoryBtn");

  const cartList = document.getElementById("cartList");

  updateProductBtn.addEventListener("click", async function () {
    const productId = updateProductForm.getAttribute("data-product-id");
    const productName = document.getElementById("updateProductName").value;
    const productPrice = document.getElementById("updateProductPrice").value;
    const category = updateCategorySelect.value;
    const productDescription = document.getElementById(
      "updateProductDescription"
    ).value;

    await updateProduct(
      productId,
      productName,
      productPrice,
      category,
      productDescription
    );
  });

  updateCategoryBtn.addEventListener("click", async function () {
    const categoryId = updateCategoryForm.getAttribute("data-category-id");
    const categoryName = document.getElementById("updateCategoryName").value;

    await updateCategory(categoryId, categoryName);
  });

  const addToCartButton = document.createElement("button");
  addToCartButton.textContent = "Add To Cart";
  addToCartButton.addEventListener("click", function () {
    addToCart(product.product_id);
  });

  productForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const category = categorySelect.value;
    const productDescription =
      document.getElementById("productDescription").value;

    const productId = productForm.getAttribute("data-product-id");

    await (productId
      ? updateProduct(
          productId,
          productName,
          productPrice,
          category,
          productDescription
        )
      : createProduct(productName, productPrice, category, productDescription));

    productForm.reset();
    productForm.removeAttribute("data-product-id");

    fetchProductList();
  });

  async function createProduct(
    productName,
    productPrice,
    category,
    productDescription
  ) {
    try {
      const response = await fetch("/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          productPrice,
          category,
          productDescription,
        }),
      });

      if (response.ok) {
        console.log("Product created successfully");
      } else {
        console.error("Failed to create product");
      }
    } catch (error) {
      console.error("Error during product creation:", error);
    }
  }

  async function handleUpdateProduct(productId) {
    const response = await fetch(`/products/${productId}`);
    const productDetails = await response.json();

    updateProductForm.setAttribute("data-product-id", productId);

    await fetchCategoriesForSelect();

    document.getElementById("updateProductName").value =
      productDetails.product_name;
    document.getElementById("updateProductPrice").value = productDetails.price;
    updateCategorySelect.value = productDetails.category_name;
    document.getElementById("updateProductDescription").value =
      productDetails.description;

    updateProductForm.style.display = "block";
  }

  async function updateProduct(
    productId,
    productName,
    productPrice,
    category,
    productDescription
  ) {
    try {
      const response = await fetch(`/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          productPrice,
          category,
          productDescription,
        }),
      });

      if (response.ok) {
        console.log("Product updated successfully");

        updateProductForm.style.display = "none";

        document.getElementById("updateProductName").value = "";
        document.getElementById("updateProductPrice").value = "";
        updateCategorySelect.value = "";
        document.getElementById("updateProductDescription").value = "";

        fetchProductList();
      } else {
        console.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error during product update:", error);
    }
  }

  categoryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const categoryName = document.getElementById("categoryName").value;

    const categoryId = categoryForm.getAttribute("data-category-id");
    await updateCategory(categoryId, categoryName);

    await (categoryId
      ? updateCategory(categoryId, categoryName)
      : createCategory(categoryName));

    categoryForm.reset();

    categoryForm.removeAttribute("data-category-id");

    fetchCategoryList();
    fetchCategoriesForSelect();
  });

  async function createCategory(categoryName) {
    try {
      const response = await fetch("/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryName,
        }),
      });

      if (response.ok) {
        console.log("Category created successfully");
      } else {
        console.error("Failed to create category");
      }
    } catch (error) {
      console.error("Error during category creation:", error);
    }
  }

  async function fetchProductList() {
    const productsResponse = await fetch("/products");
    const products = await productsResponse.json();

    productList.innerHTML = "";

    products.forEach((product) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Name: ${product.product_name}, Price: ${product.price}, Category: ${product.category_name}, Description: ${product.description}`;

      const updateButton = document.createElement("button");
      updateButton.textContent = "Update";
      updateButton.addEventListener("click", function () {
        handleUpdateProduct(product.product_id);
      });

      const addToCartButton = document.createElement("button");
      addToCartButton.textContent = "Add To Cart";
      addToCartButton.addEventListener("click", function () {
        addToCart(product.product_id);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteProduct(product.product_id);
      });

      listItem.appendChild(updateButton);
      listItem.appendChild(addToCartButton);
      listItem.appendChild(deleteButton);

      productList.appendChild(listItem);
    });
  }

  async function fetchCategoryList() {
    const categoriesResponse = await fetch("/categories");
    const categories = await categoriesResponse.json();

    categoryList.innerHTML = "";
    updateCategorySelect.innerHTML = "";

    categories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Name: ${category.category_name}`;

      const updateButton = document.createElement("button");
      updateButton.textContent = "Update";
      updateButton.addEventListener("click", function () {
        handleUpdateCategory(category.category_id);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteCategory(category.category_id);
      });

      const option = document.createElement("option");
      option.value = category.category_name;
      option.textContent = category.category_name;

      updateCategorySelect.appendChild(option.cloneNode(true));

      listItem.appendChild(updateButton);

      listItem.appendChild(deleteButton);

      categoryList.appendChild(listItem);
    });
  }

  async function handleUpdateCategory(categoryId) {
    const response = await fetch(`/categories/${categoryId}`);
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(`Error fetching category details: ${errorMessage}`);
      return;
    }
    const categoryDetails = await response.json();

    updateCategoryForm.setAttribute("data-category-id", categoryId);

    document.getElementById("updateCategoryName").value =
      categoryDetails.category_name;

    updateCategoryForm.style.display = "block";
  }

  async function updateCategory(categoryId, categoryName) {
    try {
      const response = await fetch(`/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryName,
        }),
      });

      if (response.ok) {
        console.log("Category updated successfully");

        updateCategoryForm.style.display = "none";
        document.getElementById("updateCategoryName").value = "";

        fetchCategoryList();
      } else {
        console.error("Failed to update category");
      }
    } catch (error) {
      console.error("Error during category update:", error);
    }
  }

  async function fetchCategoriesForSelect() {
    const categoriesResponse = await fetch("/categories");
    const categories = await categoriesResponse.json();

    categorySelect.innerHTML = "";

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.category_name;
      option.textContent = category.category_name;
      categorySelect.appendChild(option);
    });
  }

  async function deleteProduct(productId) {
    const response = await fetch(`/products/${productId}`, {
      method: "DELETE",
    });

    fetchProductList();
    fetchCategoriesForSelect();
  }

  async function deleteCategory(categoryId) {
    const response = await fetch(`/categories/${categoryId}`, {
      method: "DELETE",
    });

    fetchCategoryList();
    fetchCategoriesForSelect();
  }

  fetchProductList();
  fetchCategoryList();
  fetchCategoriesForSelect();
});

export async function renderCartItems(cartItems) {
  cartList.innerHTML = "";

  cartItems.forEach((item) => {
    const listItem = document.createElement("li");

    const productInfo = document.createElement("div");

    const totalPrice = item.quantity * item.price;

    productInfo.textContent = `Product Name: ${item.product_name}, Quantity: ${
      item.quantity
    }, Price: ${totalPrice.toFixed(2)}`;

    const quantityControls = document.createElement("div");

    const increaseButton = document.createElement("button");
    increaseButton.textContent = "+";
    increaseButton.addEventListener("click", async function () {
      await updateCartItemQuantity(item.cart_id, item.quantity + 1);
    });

    const decreaseButton = document.createElement("button");
    decreaseButton.textContent = "-";
    decreaseButton.addEventListener("click", async function () {
      if (item.quantity > 1) {
        await updateCartItemQuantity(item.cart_id, item.quantity - 1);
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async function () {
      const success = await CartItemAndRender(item.cart_id);
      if (success) {
        const updatedCartItems = await getCartItems();
        renderCartItems(updatedCartItems);
        updateTotalPrice(updatedCartItems);
      }
    });

    quantityControls.appendChild(increaseButton);
    quantityControls.appendChild(decreaseButton);

    listItem.appendChild(productInfo);
    listItem.appendChild(quantityControls);
    listItem.appendChild(deleteButton);

    cartList.appendChild(listItem);
  });

  updateTotalPrice(cartItems);
}

export function calculateTotalPrice(cartItems) {
  let totalPrice = 0;

  cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });

  return totalPrice.toFixed(2);
}

function updateTotalPrice(cartItems) {
  const totalElement = document.getElementById("totalPrice");

  const totalPrice = calculateTotalPrice(cartItems);

  totalElement.textContent = `Total Price: $${totalPrice}`;
}

const placeOrderButton = document.getElementById("placeOrderBtn");

placeOrderButton.addEventListener("click", showOrderForm);

async function showOrderForm() {
  try {
    const cartItems = await getCartItems();

    if (cartItems.length === 0) {
      console.error("Cannot place an order with an empty cart");
      return;
    }

    // Calculate total price and quantity
    const totalPrice = calculateTotalPrice(cartItems);

    // Create a form with pre-filled values
    const orderForm = document.createElement("form");
    orderForm.innerHTML = `
      <h2>Place Order</h2>
      
      <label for="shippingAddress">Shipping Address:</label>
      <textarea id="shippingAddress" name="shippingAddress" rows="4" required></textarea>
      
      <label>Total Price:</label>
      <input type="text" value="${totalPrice}" readonly>
      
      <label>Total Quantity:</label>
      <input type="text" value="${cartItems.length}" readonly>
      
      <label>Products:</label>
      <ul id="orderedProducts"></ul>

      <button id="submitOrderBtn" type="button">Submit Order</button>
    `;

    // Display ordered products
    const orderedProductsList = orderForm.querySelector("#orderedProducts");
    cartItems.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${item.product_name} - Quantity: ${item.quantity}`;
      orderedProductsList.appendChild(listItem);
    });

    document.body.appendChild(orderForm);

    // Function to submit the order
    const submitOrderButton = document.getElementById("submitOrderBtn");
    submitOrderButton.addEventListener("click", async function () {
      const shippingAddress = document.getElementById("shippingAddress").value;

      // Prepare order details
      const orderDetails = {
        user_id: getCookie("userId"),
        shipping_address: shippingAddress,
        product_details: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
        })),
        total_price: totalPrice,
      };

      // Call the placeOrder function
      const orderResponse = await placeOrderRequest(orderDetails);

      if (orderResponse) {
        // Optionally handle the order response, e.g., display a confirmation message
        console.log("Order response:", orderResponse);

        // Clear the cart after placing the order
        await clearCart();
        const updatedCartItems = await getCartItems();
        renderCartItems(updatedCartItems);
      }

      // Remove the order form after submitting
      document.body.removeChild(orderForm);
    });
  } catch (error) {
    console.error("Error showing order form:", error);
  }
}

async function placeOrderRequest(orderDetails) {
  try {
    const response = await fetch("/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDetails),
    });

    if (response.ok) {
      const order = await response.json();
      return order;
    } else {
      console.error("Failed to place order");
      return null;
    }
  } catch (error) {
    console.error("Error placing order:", error);
    return null;
  }
}

async function clearCart() {
  const userId = getCookie("userId");

  try {
    const response = await fetch(`/cart/${userId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Cart cleared successfully");
    } else {
      console.error("Failed to clear cart");
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
}

const initialCartItems = await getCartItems();
renderCartItems(initialCartItems);
