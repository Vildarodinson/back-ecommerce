document.addEventListener("DOMContentLoaded", function () {
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

    if (categoryForm.getAttribute("data-mode") === "update") {
      const categoryId = categoryForm.getAttribute("data-category-id");
      await updateCategory(categoryId, categoryName);
    } else {
      await createCategory(categoryName);
    }

    categoryForm.reset();

    categoryForm.removeAttribute("data-mode");
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
