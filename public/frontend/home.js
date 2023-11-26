document.addEventListener("DOMContentLoaded", function () {
  const productForm = document.getElementById("productForm");
  const productList = document.getElementById("productList");
  const categoryForm = document.getElementById("categoryForm");
  const categoryList = document.getElementById("categoryList");
  const categorySelect = document.getElementById("category");

  const updateProductForm = document.getElementById("updateProductForm");
  const updateCategorySelect = document.getElementById("updateCategory");
  const updateProductBtn = document.getElementById("updateProductBtn");

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

  productForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const category = categorySelect.value;
    const productDescription =
      document.getElementById("productDescription").value;

    if (productForm.getAttribute("data-mode") === "update") {
      const productId = productForm.getAttribute("data-product-id");
      await updateProduct(
        productId,
        productName,
        productPrice,
        category,
        productDescription
      );
    } else {
      await createProduct(
        productName,
        productPrice,
        category,
        productDescription
      );
    }

    productForm.reset();

    productForm.removeAttribute("data-mode");
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
    // Fetch product details based on the product ID
    const response = await fetch(`/products/${productId}`);
    const productDetails = await response.json();

    // Set the update form to update mode
    updateProductForm.setAttribute("data-product-id", productId);

    // Fetch categories before populating the update form
    await fetchCategoriesForSelect();

    // Populate the update form with existing product details
    document.getElementById("updateProductName").value =
      productDetails.product_name;
    document.getElementById("updateProductPrice").value = productDetails.price;
    updateCategorySelect.value = productDetails.category_name;
    document.getElementById("updateProductDescription").value =
      productDetails.description;

    // Show the update form
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
      const listItem = document.createElement("li");
      listItem.textContent = `Name: ${product.product_name}, Price: ${product.price}, Category: ${product.category_name}, Description: ${product.description}`;

      const updateButton = document.createElement("button");
      updateButton.textContent = "Update";
      updateButton.addEventListener("click", function () {
        handleUpdateProduct(product.product_id);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteProduct(product.product_id);
      });

      listItem.appendChild(updateButton);
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

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteCategory(category.category_id);
      });

      listItem.appendChild(deleteButton);

      // Create a new option element and clone it
      const option = document.createElement("option");
      option.value = category.category_name;
      option.textContent = category.category_name;

      updateCategorySelect.appendChild(option.cloneNode(true));
      categoryList.appendChild(listItem);
    });
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
