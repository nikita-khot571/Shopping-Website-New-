"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ShopZoneApp {
    constructor() {
        this.products = [];
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.init();
    }
    async init() {
        try {
            await this.loadProducts();
            this.renderProducts();
            this.updateCartCount();
            this.setupEventListeners();
        }
        catch (error) {
            console.error('Failed to initialize app:', error);
            this.loadMockProducts();
        }
    }
    loadMockProducts() {
        this.products = [
            {
                id: '1',
                name: 'iPhone 14 Pro',
                description: 'Latest Apple smartphone with A16 Bionic chip',
                price: 999.99,
                category: 'electronics',
                image: 'https://via.placeholder.com/300x200',
                stock: 50
            },
            {
                id: '2',
                name: 'MacBook Air M2',
                description: 'Lightweight laptop with M2 chip and 13-inch display',
                price: 1199.99,
                category: 'electronics',
                image: 'https://via.placeholder.com/300x200',
                stock: 25
            },
            {
                id: '3',
                name: 'The Great Gatsby',
                description: 'Classic American novel by F. Scott Fitzgerald',
                price: 12.99,
                category: 'books',
                image: 'https://via.placeholder.com/300x200',
                stock: 100
            },
            {
                id: '4',
                name: 'Nike Air Max',
                description: 'Comfortable running shoes with air cushioning',
                price: 129.99,
                category: 'clothing',
                image: 'https://via.placeholder.com/300x200',
                stock: 75
            },
            {
                id: '5',
                name: 'Coffee Maker',
                description: 'Programmable drip coffee maker with timer',
                price: 79.99,
                category: 'home',
                image: 'https://via.placeholder.com/300x200',
                stock: 30
            },
            {
                id: '6',
                name: 'Samsung Galaxy S23',
                description: 'Android smartphone with advanced camera system',
                price: 799.99,
                category: 'electronics',
                image: 'https://via.placeholder.com/300x200',
                stock: 40
            },
            {
                id: '7',
                name: 'Dune',
                description: 'Science fiction masterpiece by Frank Herbert',
                price: 15.99,
                category: 'books',
                image: 'https://via.placeholder.com/300x200',
                stock: 60
            },
            {
                id: '8',
                name: 'Levi\'s Jeans',
                description: 'Classic denim jeans with perfect fit',
                price: 59.99,
                category: 'clothing',
                image: 'https://via.placeholder.com/300x200',
                stock: 90
            },
            {
                id: '9',
                name: 'Desk Lamp',
                description: 'LED desk lamp with adjustable brightness',
                price: 39.99,
                category: 'home',
                image: 'https://via.placeholder.com/300x200',
                stock: 45
            },
            {
                id: '10',
                name: 'Wireless Headphones',
                description: 'Noise-cancelling wireless headphones',
                price: 199.99,
                category: 'electronics',
                image: 'https://via.placeholder.com/300x200',
                stock: 35
            }
        ];
        this.renderProducts();
    }
    async loadProducts() {
        try {
            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                            }
                        }
                    `
                })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            this.products = data.data.products;
        }
        catch (error) {
            console.log('GraphQL not available, using mock data');
            this.loadMockProducts();
        }
    }
    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderProducts();
            });
        }
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-cart')) {
                const productId = e.target.getAttribute('data-product-id');
                this.addToCart(productId);
            }
            if (e.target.classList.contains('quantity-increase')) {
                const productId = e.target.getAttribute('data-product-id');
                this.updateCartQuantity(productId, 1);
            }
            if (e.target.classList.contains('quantity-decrease')) {
                const productId = e.target.getAttribute('data-product-id');
                this.updateCartQuantity(productId, -1);
            }
            if (e.target.classList.contains('remove-item')) {
                const productId = e.target.getAttribute('data-product-id');
                this.removeFromCart(productId);
            }
        });
    }
    renderProducts() {
        const container = document.getElementById('productsContainer');
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (!container)
            return;
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        let filteredProducts = this.products;
        if (this.currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === this.currentCategory);
        }
        if (this.searchQuery) {
            filteredProducts = filteredProducts.filter(product => product.name.toLowerCase().includes(this.searchQuery) ||
                product.description.toLowerCase().includes(this.searchQuery));
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
        container.innerHTML = filteredProducts.map(product => `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="card product-card h-100">
                    <div class="product-image">
                        <i class="fas fa-image"></i>
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h5 class="product-name">${product.name}</h5>
                        <p class="product-description">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="product-price">${product.price}</span>
                            <small class="text-muted">${product.stock} in stock</small>
                        </div>
                        <button class="btn btn-add-cart" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus me-2"></i>Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product)
            return;
        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        }
        else {
            this.cart.push({
                ...product,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        this.saveCart();
        this.updateCartCount();
        this.showToast(`${product.name} added to cart!`, 'success');
    }
    updateCartQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item)
            return;
        item.quantity += change;
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        this.saveCart();
        this.updateCartCount();
        this.loadCartItems();
    }
    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateCartCount();
            this.loadCartItems();
            this.showToast(`${item.name} removed from cart`, 'info');
        }
    }
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cartCount');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'inline' : 'none';
        });
    }
    loadCartItems() {
        const container = document.getElementById('cartItemsContainer');
        const emptyMessage = document.getElementById('emptyCartMessage');
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (!container)
            return;
        if (this.cart.length === 0) {
            container.style.display = 'none';
            if (emptyMessage)
                emptyMessage.style.display = 'block';
            if (checkoutBtn)
                checkoutBtn.disabled = true;
            this.updateOrderSummary();
            return;
        }
        container.style.display = 'block';
        if (emptyMessage)
            emptyMessage.style.display = 'none';
        if (checkoutBtn)
            checkoutBtn.disabled = false;
        container.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <div class="cart-item-image">
                            <i class="fas fa-image"></i>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <h6 class="mb-1">${item.name}</h6>
                        <p class="text-muted mb-0">${item.description}</p>
                    </div>
                    <div class="col-md-2">
                        <span class="fw-bold">${item.price}</span>
                    </div>
                    <div class="col-md-2">
                        <div class="quantity-controls">
                            <button class="quantity-btn quantity-decrease" data-product-id="${item.id}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" value="${item.quantity}" readonly>
                            <button class="quantity-btn quantity-increase" data-product-id="${item.id}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-2 text-end">
                        <div class="fw-bold mb-2">${(item.price * item.quantity).toFixed(2)}</div>
                        <button class="btn btn-outline-danger btn-sm remove-item" data-product-id="${item.id}">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        this.updateOrderSummary();
    }
    updateOrderSummary() {
        const subtotalElement = document.getElementById('subtotal');
        const taxElement = document.getElementById('tax');
        const shippingElement = document.getElementById('shipping');
        const totalElement = document.getElementById('total');
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.085;
        const shipping = subtotal > 50 ? 0 : 5.99;
        const total = subtotal + tax + shipping;
        if (subtotalElement)
            subtotalElement.textContent = `${subtotal.toFixed(2)}`;
        if (taxElement)
            taxElement.textContent = `${tax.toFixed(2)}`;
        if (shippingElement) {
            shippingElement.textContent = shipping === 0 ? 'FREE' : `${shipping.toFixed(2)}`;
        }
        if (totalElement)
            totalElement.textContent = `${total.toFixed(2)}`;
    }
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
}
function filterByCategory(category) {
    if (window.shopZone) {
        window.shopZone.currentCategory = category;
        window.shopZone.renderProducts();
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
}
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && window.shopZone) {
        window.shopZone.searchQuery = searchInput.value.toLowerCase();
        window.shopZone.renderProducts();
    }
}
function loadCartItems() {
    if (window.shopZone) {
        window.shopZone.loadCartItems();
    }
}
function proceedToCheckout() {
    if (window.shopZone && window.shopZone.cart.length > 0) {
        const checkoutData = {
            items: window.shopZone.cart,
            subtotal: window.shopZone.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            tax: window.shopZone.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.085,
            shipping: window.shopZone.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 50 ? 0 : 5.99
        };
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        window.location.href = 'checkout.html';
    }
}
function applyPromoCode() {
    const promoCode = document.getElementById('promoCode');
    if (promoCode) {
        const code = promoCode.value.trim().toUpperCase();
        const validCodes = {
            'SAVE10': 0.10,
            'WELCOME20': 0.20,
            'NEWUSER': 0.15
        };
        if (validCodes[code]) {
            window.shopZone.showToast(`Promo code applied! ${(validCodes[code] * 100)}% off`, 'success');
        }
        else {
            window.shopZone.showToast('Invalid promo code', 'danger');
        }
        promoCode.value = '';
    }
}
function updateCartCount() {
    if (window.shopZone) {
        window.shopZone.updateCartCount();
    }
}
document.addEventListener('DOMContentLoaded', function () {
    window.shopZone = new ShopZoneApp();
    updateAuthLinks();
});
function updateAuthLinks() {
    const authLink = document.getElementById('authLink');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (authLink) {
        if (currentUser) {
            authLink.innerHTML = '<i class="fas fa-user me-1"></i>Account';
            authLink.href = 'admin.html';
        }
        else {
            authLink.innerHTML = '<i class="fas fa-user me-1"></i>Login';
            authLink.href = 'login.html';
        }
    }
}
//# sourceMappingURL=app.js.map