import { getCookie } from "./cart.js";

export async function fetchAndDisplayUserOrders(userId) {
  try {
    const response = await fetch(`/orders/user/${userId}`);
    if (response.ok) {
      const userOrders = await response.json();
      renderUserOrders(userOrders);
    } else {
      console.error("Failed to fetch user orders");
    }
  } catch (error) {
    console.error("Error fetching user orders:", error);
  }
}

export function renderUserOrders(userOrders) {
  const userOrdersList = document.getElementById("userOrdersList");
  userOrdersList.innerHTML = "";

  userOrders.forEach((order) => {
    const listItem = document.createElement("li");

    const formattedOrderDate = new Date(order.order_date).toLocaleDateString();
    const formattedOrderTime = new Date(order.order_date).toLocaleTimeString();

    listItem.innerHTML = `
      <strong>Order ID:</strong> ${order.order_id}, 
      <strong>Total Price:</strong> $${order.total_price}, 
      <strong>Shipping Address:</strong> ${order.shipping_address}, 
      <strong>Order Date:</strong> ${formattedOrderDate}, 
      <strong>Order Time:</strong> ${formattedOrderTime}, 
      <strong>Status:</strong> ${order.order_status}
    `;

    const orderDetailsList = document.createElement("ul");
    order.order_details.forEach((detail) => {
      const detailItem = document.createElement("li");
      detailItem.textContent = `${detail.product_name} - Quantity: ${detail.quantity}`;
      orderDetailsList.appendChild(detailItem);
    });

    if (order.order_status === "pending") {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Cancel Order";
      deleteButton.addEventListener("click", async function () {
        if (confirm("Are you sure you want to cancel this order?")) {
          await cancelOrder(order.order_id);
        }
      });

      listItem.appendChild(deleteButton);
    }

    listItem.appendChild(orderDetailsList);
    userOrdersList.appendChild(listItem);
  });
}

export async function placeOrderAndRender(orderDetails) {
  try {
    // Render the order locally
    renderUserOrderLocally(orderDetails);

    // Place the order on the server
    const response = await placeOrderRequest(orderDetails);
    
    if (response) {
      console.log("Order response:", response);

      // Fetch and display the user's orders
      const userId = getCookie("userId");
      await fetchAndDisplayUserOrders(userId);
    }
  } catch (error) {
    console.error("Error placing order:", error);
  }
}

async function cancelOrder(orderId) {
  try {
    await deleteOrderDetails(orderId);

    const response = await fetch(`/orders/${orderId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Order canceled successfully");

      const userId = getCookie("userId");
      await fetchAndDisplayUserOrders(userId);
    } else {
      console.error("Failed to cancel order");
    }
  } catch (error) {
    console.error("Error canceling order:", error);
  }
}

async function deleteOrderDetails(orderId) {
  const response = await fetch(`/order-details/${orderId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    console.error("Failed to delete order details");
  }
}
