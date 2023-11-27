export async function addToCart(productId) {
  try {
    const userId = getCookie("userId");
    const response = await fetch("/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        quantity: 1,
      }),
    });

    if (response.ok) {
      console.log("Product added to cart successfully");
    } else {
      console.error("Failed to add product to cart");
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
  }
}

export async function getCartItems() {
  try {
    const userId = getCookie("userId");
    const response = await fetch(`/cart/${userId}`);
    if (response.ok) {
      const cartItems = await response.json();
      return cartItems;
    } else {
      console.error("Failed to fetch cart items");
      return [];
    }
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return [];
  }
}

export function getCookie(name) {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));

  return cookieValue ? cookieValue.split("=")[1] : null;
}
