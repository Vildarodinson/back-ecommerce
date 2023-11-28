import { renderCartItems } from "./home.js";

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

      const updatedCartItems = await getCartItems();

      renderCartItems(updatedCartItems);
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

export async function deleteCartItem(cartId) {
  try {
    const response = await fetch(`/cart/${cartId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Cart item deleted successfully");
    } else {
      console.error("Failed to delete cart item");
    }
  } catch (error) {
    console.error("Error deleting cart item:", error);
  }
}

export async function CartItemAndRender(cartId) {
  try {
    await deleteCartItem(cartId);

    const updatedCartItems = await getCartItems();

    renderCartItems(updatedCartItems);

    return true;
  } catch (error) {
    console.error("Error updating cart items:", error);
    return false;
  }
}

export function getCookie(name) {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));

  return cookieValue ? cookieValue.split("=")[1] : null;
}

export async function updateCartItemQuantity(cartId, newQuantity) {
  try {
    const response = await fetch(`/cart/${cartId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: newQuantity,
      }),
    });

    if (response.ok) {
      console.log("Cart item quantity updated successfully");
      const updatedCartItems = await getCartItems();
      renderCartItems(updatedCartItems);
    } else {
      console.error("Failed to update cart item quantity");
    }
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
  }
}

// export async function clearCart() {
//   const userId = getCookie("userId");

//   try {
//     const response = await fetch(`/cart/${userId}`, {
//       method: "DELETE",
//     });

//     if (response.ok) {
//       console.log("Cart cleared successfully");
//     } else {
//       console.error("Failed to clear cart");
//     }
//   } catch (error) {
//     console.error("Error clearing cart:", error);
//   }
// }

export async function placeOrderRequest(orderDetails) {
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
