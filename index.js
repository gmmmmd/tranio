document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("productList");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortSelect = document.getElementById("sortButtons");
  const loader = document.querySelector(".loader");
  const maxPriceInput = document.getElementById("maxPrice");
  const minPriceInput = document.getElementById("minPrice");
  const filterButton = document.getElementById("minMaxButton");
  const resetFiltersButton = document.getElementById("resetFilters");
  const sortButtons = document.querySelectorAll("#sortButtons button");

  let products = [];
  let categories = [];
  let filteredProducts = [];

  let lastActiveButton = null;

  fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
      products = data.products;
      categories = data.categories;
      createCategoryFilters(categories);
      renderProducts(products);
      loader.classList.add("hidden");
      maxPriceInput.placeholder = Math.max(
        ...products.map((product) => product.price)
      );
    });

  function getUrl(product) {
    let imageUrl;

    if (window.innerWidth < 600) {
      imageUrl = product.image.mobile;
    } else if (window.innerWidth < 900) {
      imageUrl = product.image.tablet;
    } else {
      imageUrl = product.image.desktop;
    }
    return imageUrl;
  }

  // render products
  function renderProducts(productsToRender) {
    productList.innerHTML = productsToRender
      .map(
        (product) => `
      <div class="product-card">
        <img src="${getUrl(product)}" alt="${product.name}" loading="lazy">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p>Цена: ${product.price.toFixed(2)} ₽</p>
        <p>Рейтинг: ${product.rating}</p>
        <p>Категория: ${product.category}</p>
      </div>
    `
      )
      .join("");
  }

  function updateImages() {
    const productCards = document.querySelectorAll(".product-card img");

    productCards.forEach((img, index) => {
      const product = products[index];
      img.src = getUrl(product);
    });
  }

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  window.addEventListener(
    "resize",
    debounce(() => {
      updateImages();
    }, 200)
  );

  // create category filters
  function createCategoryFilters(categories) {
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  // reset filters
  resetFiltersButton.addEventListener("click", resetFilters);

  function resetFilters() {
    categoryFilter.value = "";
    sortSelect.value = "";
    maxPriceInput.value = "";
    minPriceInput.value = "";

    if (lastActiveButton) {
      lastActiveButton.classList.remove("active");
    }

    filteredProducts = [];
    renderProducts(products);
  }

  // range filters
  filterButton.addEventListener("click", applyFilters);

  // change category
  categoryFilter.addEventListener("change", applyFilters);

  // sorting
  sortButtons.forEach((button) => {
    button.addEventListener("click", handleChangeSort);
  });

  function handleChangeSort(event) {
    const button = event.target;
    if (lastActiveButton) {
      lastActiveButton.classList.remove("active");
    }

    button.classList.add("active");
    lastActiveButton = button;

    applyFilters();
  }

  // applying filters
  function applyFilters() {
    const selectedCategory = categoryFilter.value;
    const minPrice = parseFloat(minPriceInput.value) || 0;
    const maxPrice = parseFloat(maxPriceInput.value) || Infinity;

    filteredProducts = products.filter((product) => {
      const categoryMatch = selectedCategory
        ? product.category === selectedCategory
        : true;
      const priceMatch = product.price >= minPrice && product.price <= maxPrice;
      return categoryMatch && priceMatch;
    });

    if (lastActiveButton) {
      filteredProducts = sortProducts(lastActiveButton.id);
    }

    renderProducts(filteredProducts);
  }

  function sortProducts(criteria) {
    const productsList = [...filteredProducts];

    switch (criteria) {
      case "name":
        return productsList.sort((a, b) => a.name.localeCompare(b.name));
      case "priceAsc":
        return productsList.sort((a, b) => a.price - b.price);
      case "priceDesc":
        return productsList.sort((a, b) => b.price - a.price);
      case "rating":
        return productsList.sort((a, b) => b.rating - a.rating);
      default:
        return productsList;
    }
  }
});
