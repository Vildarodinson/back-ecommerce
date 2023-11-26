document.addEventListener("DOMContentLoaded", function () {
  const productForm = document.getElementById("productForm");
  const productList = document.getElementById("productList");
  const categoryForm = document.getElementById("categoryForm");
  const categoryList = document.getElementById("categoryList");
  const categorySelect = document.getElementById("category");

  productForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const category = categorySelect.value;
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

  categoryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const categoryName = document.getElementById("categoryName").value;

    const response = await fetch("/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryName,
      }),
    });

    categoryForm.reset();

    fetchCategoryList();
    fetchCategoriesForSelect();
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

  async function fetchCategoryList() {
    const categoriesResponse = await fetch("/categories");
    const categories = await categoriesResponse.json();

    categoryList.innerHTML = "";

    categories.forEach((category) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Name: ${category.category_name}`;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteCategory(category.category_id);
      });

      listItem.appendChild(deleteButton);

      categoryList.appendChild(listItem);
    });
  }

  async function deleteCategory(categoryId) {
    const response = await fetch(`/categories/${categoryId}`, {
      method: "DELETE",
    });

    fetchCategoryList();
    fetchCategoriesForSelect();
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

  fetchProductList();
  fetchCategoryList();
  fetchCategoriesForSelect();
});
