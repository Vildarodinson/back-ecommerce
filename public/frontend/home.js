document.addEventListener("DOMContentLoaded", function () {
  const productForm = document.getElementById("productForm");
  const productList = document.getElementById("productList");

  productForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const category = document.getElementById("category").value;
    const productDescription =
      document.getElementById("productDescription").value;

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


    productForm.reset();

    fetchProductList();
  });

  async function fetchProductList() {
    const productsResponse = await fetch("/products");
    const products = await productsResponse.json();

    productList.innerHTML = "";

    products.forEach((product) => {
      console.log(product);
      const listItem = document.createElement("li");
      listItem.textContent = `Name: ${product.product_name}, Price: ${product.price}, Category: ${product.category_name}, Description: ${product.description}`;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteProduct(product.product_id);
      });

      listItem.appendChild(deleteButton);

      productList.appendChild(listItem);
    });
  }

  async function deleteProduct(productId) {
    const response = await fetch(`/products/${productId}`, {
      method: "DELETE",
    });

    fetchProductList();
  }

  fetchProductList();
});
