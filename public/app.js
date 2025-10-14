// ShopZone E-commerce Application
class ShopZoneApp {
  constructor() {
    this.products = [];
    this.cart = JSON.parse(localStorage.getItem("cart")) || [];
    this.currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    this.currentCategory = "all";
    this.backendAvailable = false;
    this.checkBackendAvailability();
    this.searchQuery = "";
    console.log("ShopZone initialized with cart:", this.cart);
    this.init();
  }

  async init() {
    try {
      // Load products using GraphQL
      await this.loadProducts();
      this.renderCategories();
      this.renderProducts();

      // Load cart from backend if user is logged in
      if (this.currentUser && this.backendAvailable) {
        await this.loadCartFromBackend();
      }
      // Keep local cart for non-logged-in users

      this.updateCartCount();
      this.setupEventListeners();
      // If we're on cart page, render items immediately
      this.loadCartItems();
    } catch (error) {
      console.error("Failed to initialize app:", error);
      this.showToast("Backend not available, using demo mode", "warning");
      this.loadMockProducts();
      this.renderCategories();
    }
  }
  async checkBackendAvailability() {
    try {
      const response = await fetch("http://localhost:4001/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "{ __typename }",
        }),
      });
      this.backendAvailable = response.ok;
    } catch (error) {
      this.backendAvailable = false;
      console.warn("⚠️ Backend not available");
    }
  }
  // Mock products data for development
  loadMockProducts() {
    this.products = [
      {
        id: "1",
        name: "iPhone 14 Pro",
        description: "Latest Apple smartphone with A16 Bionic chip",
        price: 999.99,
        category: "electronics",
        image: "https://via.placeholder.com/300x200",
        stock: 50,
      },
      {
        id: "2",
        name: "MacBook Air M2",
        description: "Lightweight laptop with M2 chip and 13-inch display",
        price: 1199.99,
        category: "electronics",
        image: "https://via.placeholder.com/300x200",
        stock: 25,
      },
      {
        id: "3",
        name: "The Great Gatsby",
        description: "Classic American novel by F. Scott Fitzgerald",
        price: 12.99,
        category: "books",
        image: "https://via.placeholder.com/300x200",
        stock: 100,
      },
      {
        id: "4",
        name: "Nike Air Max",
        description: "Comfortable running shoes with air cushioning",
        price: 129.99,
        category: "clothing",
        image: "https://via.placeholder.com/300x200",
        stock: 75,
      },
      {
        id: "5",
        name: "Coffee Maker",
        description: "Programmable drip coffee maker with timer",
        price: 79.99,
        category: "home",
        image: "https://via.placeholder.com/300x200",
        stock: 30,
      },
      {
        id: "6",
        name: "Samsung Galaxy S23",
        description: "Android smartphone with advanced camera system",
        price: 799.99,
        category: "electronics",
        image: "https://via.placeholder.com/300x200",
        stock: 40,
      },
      {
        id: "7",
        name: "Dune",
        description: "Science fiction masterpiece by Frank Herbert",
        price: 15.99,
        category: "books",
        image: "https://via.placeholder.com/300x200",
        stock: 60,
      },
      {
        id: "8",
        name: "Levi's Jeans",
        description: "Classic denim jeans with perfect fit",
        price: 59.99,
        category: "clothing",
        image: "https://via.placeholder.com/300x200",
        stock: 90,
      },
      {
        id: "9",
        name: "Desk Lamp",
        description: "LED desk lamp with adjustable brightness",
        price: 39.99,
        category: "home",
        image: "https://via.placeholder.com/300x200",
        stock: 45,
      },
      {
        id: "10",
        name: "Wireless Headphones",
        description: "Noise-cancelling wireless headphones",
        price: 199.99,
        category: "electronics",
        image: "https://via.placeholder.com/300x200",
        stock: 35,
      },
      
    ];
    this.renderProducts();
  }

  async loadProducts() {
    try {
      const response = await fetch("http://localhost:4001/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query GetProducts {
              products {
                id
                name
                description
                price
                category
                image
                stock
                createdAt
              }
            }
          `,
        }),
      });
      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors.map((err) => err.message).join(", "));
      }
      this.products = data.data.products;
      this.backendAvailable = true;
    } catch (error) {
      console.log("Failed to load products from backend:", error.message);
      this.backendAvailable = false;
      this.products = [];
    }
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderProducts();
      });
    }

    // Cart events
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-add-cart")) {
        const productId = e.target.getAttribute("data-product-id");
        this.addToCart(productId);
      }

      if (e.target.classList.contains("quantity-increase")) {
        const productId = e.target.getAttribute("data-product-id");
        this.updateCartQuantity(productId, 1);
      }

      if (e.target.classList.contains("quantity-decrease")) {
        const productId = e.target.getAttribute("data-product-id");
        this.updateCartQuantity(productId, -1);
      }

      if (e.target.classList.contains("remove-item")) {
        const productId = e.target.getAttribute("data-product-id");
        this.removeFromCart(productId);
      }
    });
  }

  renderCategories() {
    const container = document.getElementById("categoryContainer");
    if (!container) return;

    // Get unique categories from products using uniqueCategories variable to avoid duplicates
    const uniqueCategories = [...new Set(this.products.map(p => p.category))];
    const categories = ["all", ...uniqueCategories];

    container.innerHTML = categories
      .map(
        (category) => `
            <button class="category-btn ${category === this.currentCategory ? 'active' : ''}" data-category="${category}" onclick="filterByCategory('${category}')">
                ${category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
        `
      )
      .join("");
  }

  renderProducts() {
    const container = document.getElementById("productsContainer");
    const loadingSpinner = document.getElementById("loadingSpinner");

    if (!container) return;

    if (loadingSpinner) {
      loadingSpinner.style.display = "none";
    }

    let filteredProducts = this.products;

    // Filter by category
    if (this.currentCategory !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === this.currentCategory
      );
    }

    // Filter by search query
    if (this.searchQuery) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(this.searchQuery) ||
          product.description.toLowerCase().includes(this.searchQuery)
      );
    }

    if (filteredProducts.length === 0) {
      container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search text-muted" style="font-size: 4rem;"></i>
                    <h4 class="mt-3 text-muted">No products found</h4>
                    <p class="text-muted">Try adjusting your search or filter criteria</p>
                </div>
            `;
      return;
    }

    container.innerHTML = filteredProducts
      .map(
        (product) => `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="card product-card h-100" data-product-id="${product.id}" onclick="openProductDetail('${product.id}')" style="cursor:pointer;">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" class="img-fluid" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=No+Image';" />
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h5 class="product-name">${product.name}</h5>
                        <p class="product-description">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="product-price">${product.price}</span>
                            <small class="text-muted">${product.stock} in stock</small>
                        </div>
                        <button class="btn btn-add-cart" data-product-id="${product.id}" onclick="event.stopPropagation(); addToCartFromCard('${product.id}')">
                            <i class="fas fa-cart-plus me-2"></i>Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }



  async logout() {
    // Clear backend cart if user is logged in
    if (this.currentUser && this.backendAvailable && window.graphqlService) {
      try {
        await window.graphqlService.clearCart();
      } catch (error) {
        console.error("Failed to clear cart on logout:", error);
        // Continue with logout even if cart clearing fails
      }
    }

    // Clear local cart
    this.cart = [];
    localStorage.removeItem("cart");

    // Clear auth data from localStorage and GraphQL service
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    this.currentUser = null;

    // Clear GraphQL service auth state
    if (window.graphqlService && typeof window.graphqlService.logout === 'function') {
      window.graphqlService.logout();
    }

    // Update UI
    this.updateCartCount();
    this.loadCartItems();

    this.showToast("Logged out successfully", "info");
    updateAuthLinks();
    window.location.href = "index.html";
  }

  async loadCartFromBackend() {
    if (this.currentUser && this.backendAvailable && window.graphqlService && typeof window.graphqlService.getCart === 'function') {
      try {
        const cartData = await window.graphqlService.getCart();
        console.log("Raw cart data from backend:", cartData);
        
        // Transform backend cart data to match local format
        // Support both shapes: { cart: [...] } and { cart: { items: [...] } }
        const backendItems = Array.isArray(cartData?.cart)
          ? cartData.cart
          : Array.isArray(cartData?.cart?.items)
            ? cartData.cart.items
            : [];

        this.cart = backendItems.map(item => {
          console.log("Processing cart item:", item);
          // Prefer embedded product, otherwise find from loaded products
          const productFromItem = item.product;
          const productFromList = this.products.find(p => String(p.id) === String(item.productId));
          const product = productFromItem || productFromList || {};

          const id = product.id ?? item.productId;
          const name = product.name ?? undefined;
          const description = product.description ?? undefined;
          const price = product.price ?? 0;
          const image = product.image ?? undefined;

          return {
            id,
            name,
            description,
            price,
            image,
            quantity: parseInt(item.quantity) || 1,
            addedAt: new Date().toISOString(),
          };
        });
        
        console.log("Transformed cart:", this.cart);
        this.saveCart(); // Save to localStorage for consistency
        this.updateCartCount();
        this.loadCartItems();
      } catch (error) {
        console.error("Failed to load cart from backend:", error);
      }
    }
  }

  async addToCart(productId) {
    // Coerce id comparison to string to avoid number/string mismatch
    const product = this.products.find((p) => String(p.id) === String(productId));
    if (!product) {
      console.error("Product not found:", productId);
      return;
    }
    console.log("Adding product to cart:", product.name);
    console.log("Product data:", product);

    let addedViaGraphQL = false;

    // If user is logged in and backend is available, use GraphQL
    if (this.currentUser && this.backendAvailable && window.graphqlService && typeof window.graphqlService.addToCart === 'function') {
      try {
        await window.graphqlService.addToCart(productId, 1);
        this.showToast(`${product.name} added to cart!`, "success");
        // Refresh cart from backend
        await this.loadCartFromBackend();
        addedViaGraphQL = true;
        return;
      } catch (error) {
        console.error("Failed to add to cart via GraphQL:", error);
        this.showToast("Failed to add to cart, using local storage", "warning");
      }
    }

    // Fallback to local storage only if GraphQL failed or not available
    if (!addedViaGraphQL) {
      const existingItem = this.cart.find((item) => item.id === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.cart.push({
          ...product,
          quantity: 1,
          addedAt: new Date().toISOString(),
        });
      }

      this.saveCart();
      this.updateCartCount();
      console.log("Cart after adding item:", this.cart);
      this.showToast(`${product.name} added to cart!`, "success");
    }
  }

  async updateCartQuantity(productId, change) {
    // If user is logged in and backend is available, use GraphQL
    if (this.currentUser && this.backendAvailable && window.graphqlService && typeof window.graphqlService.updateCartItem === 'function') {
      try {
        const newQuantity = this.cart.find(item => item.id === productId)?.quantity + change || change;
        if (newQuantity <= 0) {
          await this.removeFromCart(productId);
          return;
        }
        await window.graphqlService.updateCartItem(productId, newQuantity);
        await this.loadCartFromBackend();
        this.loadCartItems();
        return;
      } catch (error) {
        console.error("Failed to update cart quantity via GraphQL:", error);
        this.showToast("Failed to update quantity, using local storage", "warning");
      }
    }

    // Fallback to local storage
    const item = this.cart.find((item) => item.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.saveCart();
    this.updateCartCount();
    this.loadCartItems(); // Refresh cart display
  }

  async removeFromCart(productId) {
    // If user is logged in and backend is available, use GraphQL
    if (this.currentUser && this.backendAvailable && window.graphqlService && typeof window.graphqlService.removeFromCart === 'function') {
      try {
        await window.graphqlService.removeFromCart(productId);
        await this.loadCartFromBackend();
        this.loadCartItems();
        return;
      } catch (error) {
        console.error("Failed to remove from cart via GraphQL:", error);
        this.showToast("Failed to remove item, using local storage", "warning");
      }
    }

    // Fallback to local storage
    const itemIndex = this.cart.findIndex((item) => item.id === productId);
    if (itemIndex > -1) {
      const item = this.cart[itemIndex];
      this.cart.splice(itemIndex, 1);
      this.saveCart();
      this.updateCartCount();
      this.loadCartItems(); // Refresh cart display
      this.showToast(`${item.name} removed from cart`, "info");
    }
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  updateCartCount() {
    const cartCountElements = document.querySelectorAll("#cartCount");
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);

    cartCountElements.forEach((element) => {
      element.textContent = totalItems;
      element.style.display = totalItems > 0 ? "inline" : "none";
    });
  }

   loadCartItems() {
    const container = document.getElementById("cartItemsContainer");
    const emptyMessage = document.getElementById("emptyCartMessage");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (!container) return;
    
    console.log("Loading cart items, cart length:", this.cart.length);
    console.log("Cart items data:", this.cart);

    if (this.cart.length === 0) {
      container.innerHTML = '';
      container.style.display = "none";
      if (emptyMessage) emptyMessage.style.display = "block";
      if (checkoutBtn) checkoutBtn.disabled = true;
      this.updateOrderSummary();
      return;
    }

    container.style.display = "block";
    if (emptyMessage) emptyMessage.style.display = "none";
    if (checkoutBtn) checkoutBtn.disabled = false;

    container.innerHTML = this.cart
      .map(
        (item) => {
          console.log("Rendering cart item:", item);
          const name = item.name || 'Unknown Product';
          const description = item.description || 'No description available';
          const price = parseFloat(item.price) || 0;
          const quantity = parseInt(item.quantity) || 1;
          const id = item.id || 'unknown';
          const image = item.image; // Get the image URL from the item

          return `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <div class="cart-item-image">
                            <img src="${image}" alt="${name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/80?text=No+Image';">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <h6 class="mb-0 text-truncate" title="${name}">${name}</h6>
                    </div>
                    <div class="col-md-2 text-md-center mt-2 mt-md-0">
                        <span class="fw-bold price-value">₹${price.toFixed(2)}</span>
                    </div>
                    <div class="col-md-3 mt-2 mt-md-0">
                        <div class="cart-actions">
                            <div class="quantity-controls">
                                <button class="quantity-btn quantity-decrease" data-product-id="${id}">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" class="quantity-input" value="${quantity}" readonly>
                                <button class="quantity-btn quantity-increase" data-product-id="${id}">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="btn btn-outline-danger btn-sm remove-item" data-product-id="${id}">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        }
      )
      .join("");

    this.updateOrderSummary();
  }

  updateOrderSummary() {
    const subtotalElement = document.getElementById("subtotal");
    const taxElement = document.getElementById("tax");
    const shippingElement = document.getElementById("shipping");
    const totalElement = document.getElementById("total");

    const subtotal = this.cart.reduce(
      (sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return sum + (price * quantity);
      },
      0
    );
    const tax = subtotal * 0.085; // 8.5% tax
    const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over ₹50
    const total = subtotal + tax + shipping;

    console.log("Order summary - subtotal:", subtotal, "tax:", tax, "shipping:", shipping, "total:", total);

    if (subtotalElement) subtotalElement.textContent = `${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `${tax.toFixed(2)}`;
    if (shippingElement) {
      shippingElement.textContent =
        shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`;
    }
    if (totalElement) totalElement.textContent = `${total.toFixed(2)}`;
  }

  proceedToCheckout() {
    console.log("ShopZoneApp.proceedToCheckout called");
    console.log("Cart:", this.cart);
    
    if (!this.cart || this.cart.length === 0) {
      console.error("Cart is empty");
      this.showToast("Your cart is empty. Please add items to proceed to checkout.", "warning");
      return;
    }

    // Calculate totals
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.085;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shipping;

    console.log("Calculated totals:", { subtotal, tax, shipping, total });

    // Save checkout data for checkout page
    const checkoutData = {
      items: this.cart,
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: total
    };

    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    console.log("Checkout data saved:", checkoutData);
    window.location.href = "checkout.html";
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute("role", "alert");
    toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

    // Add to toast container or create one
    let toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className =
        "toast-container position-fixed bottom-0 end-0 p-3";
      document.body.appendChild(toastContainer);
    }

    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove();
    });
  }
}// end of class

// Navigation helpers
function openProductDetail(productId) {
  window.location.href = `product.html?id=${encodeURIComponent(productId)}`;
}

async function addToCartFromCard(productId) {
  if (window.shopZone && typeof window.shopZone.addToCart === 'function') {
    await window.shopZone.addToCart(productId, 1);
  }
}

// Global functions
async function filterByCategory(category) {
  if (window.shopZone && typeof window.shopZone.loadProducts === 'function' && typeof window.shopZone.renderProducts === 'function') {
    window.shopZone.currentCategory = category;

    // Reload products from backend if available
    if (window.shopZone.backendAvailable && window.graphqlService && typeof window.graphqlService.loadProducts === 'function') {
      try {
        await window.shopZone.loadProducts();
      } catch (error) {
        console.log("Failed to load products from backend, using cached data");
      }
    }

    window.shopZone.renderProducts();

    // Update active category button
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
      activeBtn.classList.add("active");
    }
  }
}

async function searchProducts() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput && window.shopZone && typeof window.shopZone.loadProducts === 'function' && typeof window.shopZone.renderProducts === 'function') {
    window.shopZone.searchQuery = searchInput.value.toLowerCase();

    // Reload products from backend if available
    if (window.shopZone.backendAvailable && window.graphqlService && typeof window.graphqlService.loadProducts === 'function') {
      try {
        await window.shopZone.loadProducts();
      } catch (error) {
        console.log("Failed to load products from backend, using cached data");
      }
    }

    window.shopZone.renderProducts();
  }
}

function loadCartItems() {
  if (window.shopZone) {
    window.shopZone.loadCartItems();
  }
}

function proceedToCheckout() {
  console.log("Global proceedToCheckout called");
  
  if (!window.shopZone) {
    console.error("shopZone not initialized");
    alert("Please wait for the page to load completely");
    return;
  }
  
  // Use the ShopZoneApp method
  window.shopZone.proceedToCheckout();
}

function applyPromoCode() {
  const promoCode = document.getElementById("promoCode");
  if (promoCode) {
    const code = promoCode.value.trim().toUpperCase();

    // Mock promo codes
    const validCodes = {
      SAVE10: 0.1,
      WELCOME20: 0.2,
      NEWUSER: 0.15,
    };

    if (validCodes[code]) {
      window.shopZone.showToast(
        `Promo code applied! ${validCodes[code] * 100}% off`,
        "success"
      );
      // Apply discount logic here
    } else {
      window.shopZone.showToast("Invalid promo code", "danger");
    }

    promoCode.value = "";
  }
}

function updateCartCount() {
  if (window.shopZone) {
    window.shopZone.updateCartCount();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.shopZone = new ShopZoneApp();

  // Update auth links based on login status
  updateAuthLinks();
});

function updateAuthLinks() {
  const authLink = document.getElementById("authLink");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (authLink) {
    if (currentUser) {
      authLink.innerHTML = '<i class="fas fa-user me-1"></i>Account';
      authLink.href = currentUser.role === "admin" ? "admin.html" : "profile.html";
    } else {
      authLink.innerHTML = '<i class="fas fa-user me-1"></i>Login';
      authLink.href = "login.html";
    }
  }
}