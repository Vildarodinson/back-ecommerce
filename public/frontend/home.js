document.addEventListener("DOMContentLoaded", function () {
  const productForm = document.getElementById("productForm");

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

    const result = await response.json();
    alert(result.message);
  });
});
