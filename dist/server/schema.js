"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("./database/models");
const uuid_1 = require("uuid");
exports.typeDefs = (0, apollo_server_express_1.gql) `
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phone: String
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    category: String!
    image: String
    stock: Int!
    createdAt: String!
    updatedAt: String!
  }

  type CartItem {
    id: ID!
    userId: ID!
    productId: ID!
    quantity: Int!
    product: Product!
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    id: ID!
    orderId: ID!
    productId: ID!
    quantity: Int!
    price: Float!
    product: Product!
    createdAt: String!
    updatedAt: String!
  }

  type Order {
    id: ID!
    userId: ID!
    total: Float!
    status: String!
    shippingAddress: String!
    paymentMethod: String!
    items: [OrderItem!]!
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    products(
      category: String
      search: String
      limit: Int
      offset: Int
    ): [Product!]!
    product(id: ID!): Product
    me: User
    cart: [CartItem!]!
    orders: [Order!]!
    users: [User!]!
    allOrders: [Order!]!
    adminProducts: [Product!]!
  }

  type Mutation {
    register(
      email: String!
      password: String!
      firstName: String!
      lastName: String!
      phone: String
    ): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    addToCart(productId: ID!, quantity: Int!): CartItem!
    updateCartQuantity(productId: ID!, quantity: Int!): CartItem!
    removeFromCart(productId: ID!): Boolean!
    clearCart: Boolean!
    logout: Boolean!

    createOrder(shippingAddress: String!, paymentMethod: String!): Order!
    updateOrderStatus(id: ID!, status: String!): Order!

    updateProfile(firstName: String, lastName: String, phone: String): User!

    createProduct(
      name: String!
      description: String
      price: Float!
      category: String!
      image: String
      stock: Int!
    ): Product!
    updateProduct(
      id: ID!
      name: String
      description: String
      price: Float
      category: String
      image: String
      stock: Int
    ): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;
// Authentication middleware
const getUser = async (req) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token)
        return null;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key-123456789");
        const user = await models_1.User.findByPk(decoded.userId);
        return user;
    }
    catch (error) {
        console.log("Token verification failed:", error);
        return null;
    }
};
exports.resolvers = {
    Query: {
        products: async (_, { category, search, limit = 50, offset = 0 }) => {
            try {
                const where = {};
                if (category && category !== "all") {
                    where.category = category;
                }
                if (search) {
                    where.name = { [require('sequelize').Op.iLike]: `%${search}%` };
                }
                const products = await models_1.Product.findAll({
                    where,
                    limit: Math.min(limit, 100),
                    offset: Math.max(offset, 0),
                });
                return products;
            }
            catch (error) {
                console.error("Error fetching products:", error);
                throw new Error("Failed to fetch products");
            }
        },
        product: async (_, { id }) => {
            try {
                const product = await models_1.Product.findByPk(id);
                if (!product) {
                    throw new Error("Product not found");
                }
                return product;
            }
            catch (error) {
                console.error("Error fetching product:", error);
                throw new Error("Failed to fetch product");
            }
        },
        me: async (_, __, { req }) => {
            return getUser(req);
        },
        cart: async (_, __, { req }) => {
            const user = await getUser(req);
            if (!user)
                throw new Error("Not authenticated");
            try {
                const cartItems = await models_1.CartItem.findAll({
                    where: { userId: user.id },
                    include: [
                        {
                            model: models_1.Product,
                            required: false // LEFT JOIN instead of INNER JOIN
                        }
                    ],
                });
                // Filter out cart items with deleted/missing products
                const validCartItems = cartItems.filter(item => {
                    const product = item.Product || item.product;
                    return product !== null && product !== undefined;
                });
                // Clean up orphaned cart items (items with deleted products)
                const orphanedItems = cartItems.filter(item => {
                    const product = item.Product || item.product;
                    return product === null || product === undefined;
                });
                if (orphanedItems.length > 0) {
                    const orphanedIds = orphanedItems.map(item => item.id);
                    await models_1.CartItem.destroy({
                        where: {
                            id: orphanedIds
                        }
                    });
                    console.log(`🧹 Cleaned up ${orphanedItems.length} orphaned cart items`);
                }
                return validCartItems;
            }
            catch (error) {
                console.error("Error fetching cart:", error);
                throw new Error("Failed to fetch cart");
            }
        },
        orders: async (_, __, { req }) => {
            const user = await getUser(req);
            if (!user)
                throw new Error("Not authenticated");
            try {
                const orders = await models_1.Order.findAll({
                    where: { userId: user.id },
                    order: [["createdAt", "DESC"]],
                });
                return orders;
            }
            catch (error) {
                console.error("Error fetching orders:", error);
                throw new Error("Failed to fetch orders");
            }
        },
        users: async (_, __, { req }) => {
            const user = await getUser(req);
            if (!user || user.role !== "admin") {
                throw new Error("Admin access required");
            }
            try {
                return models_1.User.findAll({
                    order: [["createdAt", "DESC"]],
                });
            }
            catch (error) {
                console.error("Error fetching users:", error);
                throw new Error("Failed to fetch users");
            }
        },
        allOrders: async (_, __, { req }) => {
            const user = await getUser(req);
            if (!user || user.role !== "admin") {
                console.log("Admin access required - user:", user ? user.email : 'null', 'role:', user ? user.role : 'null');
                throw new Error("Admin access required");
            }
            try {
                console.log("Fetching all orders for admin:", user.email);
                const orders = await models_1.Order.findAll({
                    order: [["createdAt", "DESC"]],
                });
                console.log(`Found ${orders.length} orders`);
                return orders;
            }
            catch (error) {
                console.error("Error fetching all orders:", error);
                throw new Error("Failed to fetch all orders");
            }
        },
        adminProducts: async (_, __, { req }) => {
            const user = await getUser(req);
            if (!user || user.role !== "admin") {
                throw new Error("Admin access required");
            }
            try {
                const allProducts = await models_1.Product.findAll();
                const categories = [...new Set(allProducts.map(p => p.category))];
                const products = [];
                for (const category of categories) {
                    const categoryProducts = await models_1.Product.findAll({
                        where: { category },
                        limit: 6
                    });
                    products.push(...categoryProducts);
                }
                return products;
            }
            catch (error) {
                console.error("Error fetching admin products:", error);
                throw new Error("Failed to fetch products");
            }
        },
    },
    Mutation: {
        register: async (_, { email, password, firstName, lastName, phone }) => {
            try {
                if (!email || !password || !firstName || !lastName) {
                    throw new Error("All required fields must be provided");
                }
                if (password.length < 6) {
                    throw new Error("Password must be at least 6 characters long");
                }
                const existingUser = await models_1.User.findOne({
                    where: { email: email.toLowerCase() },
                });
                if (existingUser) {
                    throw new Error("User with this email already exists");
                }
                const hashedPassword = await bcryptjs_1.default.hash(password, 12);
                const user = await models_1.User.create({
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone ? phone.trim() : null,
                    role: "customer",
                });
                const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || "your-secret-key-123456789", { expiresIn: "7d" });
                console.log("✅ New user registered:", user.email);
                return { token, user };
            }
            catch (error) {
                console.error("Registration error:", error);
                throw new Error(error.message || "Registration failed");
            }
        },
        login: async (_, { email, password }) => {
            try {
                if (!email || !password) {
                    throw new Error("Email and password are required");
                }
                const user = await models_1.User.findOne({
                    where: { email: email.toLowerCase().trim() },
                });
                if (!user) {
                    throw new Error("Invalid email or password");
                }
                const isValid = await bcryptjs_1.default.compare(password, user.password);
                if (!isValid) {
                    throw new Error("Invalid email or password");
                }
                const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || "your-secret-key-123456789", { expiresIn: "7d" });
                console.log("✅ User logged in:", user.email);
                return { token, user };
            }
            catch (error) {
                console.error("Login error:", error);
                throw new Error(error.message || "Login failed");
            }
        },
        addToCart: async (_, { productId, quantity }, { req }) => {
            const user = await getUser(req);
            if (!user)
                throw new Error("Not authenticated");
            try {
                const product = await models_1.Product.findByPk(productId);
                if (!product)
                    throw new Error("Product not found");
                if (product.stock < quantity) {
                    throw new Error("Not enough stock available");
                }
                const existingCartItem = await models_1.CartItem.findOne({
                    where: { userId: user.id, productId },
                });
                if (existingCartItem) {
                    existingCartItem.quantity += quantity;
                    await existingCartItem.save();
                    return existingCartItem;
                }
                else {
                    const cartItem = await models_1.CartItem.create({
                        id: (0, uuid_1.v4)(),
                        userId: user.id,
                        productId,
                        quantity,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    return cartItem;
                }
            }
            catch (error) {
                console.error("Add to cart error:", error);
                throw new Error(error.message || "Failed to add item to cart");
            }
        },
        updateCartQuantity: async (_, { productId, quantity }, { req }) => {
            const user = await getUser(req);
            if (!user)
                throw new Error("Not authenticated");
            try {
                const cartItem = await models_1.CartItem.findOne({
                    where: { userId: user.id, productId },
                });
                if (!cartItem)
                    throw new Error("Cart item not found");
                if (quantity <= 0) {
                    await models_1.CartItem.destroy({ where: { userId: user.id, productId } });
                    return null;
                }
                cartItem.quantity = quantity;
                await cartItem.save();
                return cartItem;
            }
            catch (error) {
                console.error("Update cart error:", error);
                throw new Error(error.message || "Failed to update cart item");
            }
        },
        removeFromCart: async (_, { productId }, { req }) => {
            const user = await getUser(req);
            if (!user)
                throw new Error("Not authenticated");
            try {
                await models_1.CartItem.destroy({ where: { userId: user.id, productId } });
                return true;
            }
            catch (error) {
                console.error("Remove from cart error:", error);
                throw new Error(error.message || "Failed to remove item from cart");
            }
        },
        clearCart: async (_, __, { req }) => {
            const user = await getUser(req);
            if (!user)
                throw new Error("Not authenticated");
            try {
                await models_1.CartItem.destroy({ where: { userId: user.id } });
                return true;
            }
            catch (error) {
                console.error("Clear cart error:", error);
                throw new Error("Failed to clear cart");
            }
        },
        logout: async (_, __, { req }) => {
            const user = await getUser(req);
            if (!user)
                throw new Error("Not authenticated");
            try {
                const roleLabel = user.role === "admin" ? "Admin" : "User";
                console.log(`✅ ${roleLabel} logged out: ${user.email}`);
                return true;
            }
            catch (error) {
                console.error("Logout error:", error);
                throw new Error("Failed to logout");
            }
        },
        createOrder: async (_, { shippingAddress, paymentMethod }, { req }) => {
            const user = await getUser(req);
            if (!user)
                throw new Error("Not authenticated");
            try {
                // Get cart items with product association
                const cartItems = await models_1.CartItem.findAll({
                    where: { userId: user.id },
                    include: [
                        {
                            model: models_1.Product,
                            required: false
                        }
                    ],
                });
                // Filter valid cart items (with existing products)
                const validCartItems = cartItems.filter(item => {
                    const product = item.Product || item.product;
                    return product !== null && product !== undefined;
                });
                if (validCartItems.length === 0) {
                    // Clean up any orphaned cart items
                    await models_1.CartItem.destroy({ where: { userId: user.id } });
                    throw new Error("Cart is empty");
                }
                // Calculate total
                let subtotal = 0;
                const itemsToProcess = [];
                for (const item of validCartItems) {
                    const product = await models_1.Product.findByPk(item.productId);
                    if (!product) {
                        console.log(`⚠️ Product ${item.productId} not found, skipping`);
                        continue;
                    }
                    if (product.stock < item.quantity) {
                        throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
                    }
                    subtotal += parseFloat(String(product.price)) * item.quantity;
                    itemsToProcess.push({
                        cartItem: item,
                        product: product
                    });
                }
                if (itemsToProcess.length === 0) {
                    throw new Error("No valid items in cart");
                }
                // Calculate tax and shipping
                const tax = subtotal * 0.085; // 8.5% tax
                const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
                const total = subtotal + tax + shipping;
                // Create order
                const order = await models_1.Order.create({
                    id: (0, uuid_1.v4)(),
                    userId: user.id,
                    total: total,
                    status: "pending",
                    shippingAddress: typeof shippingAddress === "string"
                        ? shippingAddress
                        : JSON.stringify(shippingAddress),
                    paymentMethod: typeof paymentMethod === "string"
                        ? paymentMethod
                        : JSON.stringify(paymentMethod),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log(`📦 Creating order ${order.id} with ${itemsToProcess.length} items`);
                // Create order items and update stock
                for (const { cartItem, product } of itemsToProcess) {
                    await models_1.OrderItem.create({
                        id: (0, uuid_1.v4)(),
                        orderId: order.id,
                        productId: cartItem.productId,
                        quantity: cartItem.quantity,
                        price: parseFloat(String(product.price)),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    // Update stock
                    product.stock -= cartItem.quantity;
                    await product.save();
                    console.log(`   ✓ ${product.name} - Qty: ${cartItem.quantity}, Stock remaining: ${product.stock}`);
                }
                // Clear entire cart (including any orphaned items)
                await models_1.CartItem.destroy({ where: { userId: user.id } });
                console.log(`🧹 Cart cleared for user ${user.email}`);
                // Return order with all associations
                const createdOrder = await models_1.Order.findByPk(order.id, {
                    include: [
                        { model: models_1.User },
                        {
                            model: models_1.OrderItem,
                            include: [{ model: models_1.Product }],
                        },
                    ],
                });
                console.log(`✅ Order ${order.id} created successfully`);
                return createdOrder;
            }
            catch (error) {
                console.error("Create order error:", error);
                throw new Error(error.message || "Failed to create order");
            }
        },
        updateOrderStatus: async (_, { id, status }, { req }) => {
            const user = await getUser(req);
            if (!user)
                throw new Error("Not authenticated");
            try {
                const order = await models_1.Order.findByPk(id);
                if (!order)
                    throw new Error("Order not found");
                if (order.userId !== user.id && user.role !== "admin") {
                    throw new Error("Not authorized");
                }
                order.status = status;
                await order.save();
                return models_1.Order.findByPk(order.id, {
                    include: [
                        { model: models_1.User },
                        {
                            model: models_1.OrderItem,
                            include: [{ model: models_1.Product }],
                        },
                    ],
                });
            }
            catch (error) {
                console.error("Update order error:", error);
                throw new Error(error.message || "Failed to update order status");
            }
        },
        updateProfile: async (_, { firstName, lastName, phone }, { req }) => {
            const user = await getUser(req);
            if (!user)
                throw new Error("Not authenticated");
            try {
                // Update user fields
                if (firstName !== undefined && firstName !== null) {
                    user.firstName = firstName.trim();
                }
                if (lastName !== undefined && lastName !== null) {
                    user.lastName = lastName.trim();
                }
                if (phone !== undefined) {
                    user.phone = phone ? phone.trim() : null;
                }
                user.updatedAt = new Date();
                // Save the updated user
                await user.save();
                // Return the fresh user data from database
                const updatedUser = await models_1.User.findByPk(user.id);
                console.log("✅ Profile updated for user:", updatedUser?.email);
                return updatedUser;
            }
            catch (error) {
                console.error("Update profile error:", error);
                throw new Error(error.message || "Failed to update profile");
            }
        },
        createProduct: async (_, { name, description, price, category, image, stock }, { req }) => {
            const user = await getUser(req);
            if (!user || user.role !== "admin") {
                throw new Error("Admin access required");
            }
            try {
                const now = new Date();
                const product = await models_1.Product.create({
                    id: (0, uuid_1.v4)(),
                    name: name.trim(),
                    description: description ? description.trim() : null,
                    price,
                    category,
                    image: image || null,
                    stock,
                    createdAt: now,
                    updatedAt: now,
                });
                console.log("✅ Admin created product:", product.name);
                return product;
            }
            catch (error) {
                console.error("Create product error:", error);
                throw new Error(error.message || "Failed to create product");
            }
        },
        updateProduct: async (_, { id, name, description, price, category, image, stock }, { req }) => {
            const user = await getUser(req);
            if (!user || user.role !== "admin") {
                throw new Error("Admin access required");
            }
            try {
                const product = await models_1.Product.findByPk(id);
                if (!product)
                    throw new Error("Product not found");
                if (name)
                    product.name = name.trim();
                if (description !== undefined)
                    product.description = description ? description.trim() : null;
                if (price !== undefined)
                    product.price = price;
                if (category)
                    product.category = category;
                if (image !== undefined)
                    product.image = image || null;
                if (stock !== undefined)
                    product.stock = stock;
                await product.save();
                return product;
            }
            catch (error) {
                console.error("Update product error:", error);
                throw new Error(error.message || "Failed to update product");
            }
        },
        deleteProduct: async (_, { id }, { req }) => {
            const user = await getUser(req);
            if (!user || user.role !== "admin") {
                throw new Error("Admin access required");
            }
            try {
                const product = await models_1.Product.findByPk(id);
                if (!product)
                    throw new Error("Product not found");
                await models_1.Product.destroy({ where: { id } });
                console.log("✅ Admin deleted product:", product.name);
                return true;
            }
            catch (error) {
                console.error("Delete product error:", error);
                throw new Error(error.message || "Failed to delete product");
            }
        },
    },
    // Field resolvers for Order type
    Order: {
        items: async (order) => {
            try {
                if (!order || !order.id) {
                    console.log("Order or order.id is missing:", order);
                    return [];
                }
                const orderItems = await models_1.OrderItem.findAll({
                    where: { orderId: order.id },
                    include: [{ model: models_1.Product }],
                });
                console.log(`Found ${orderItems.length} items for order ${order.id}`);
                return orderItems;
            }
            catch (error) {
                console.error("Error fetching order items:", error);
                return [];
            }
        },
        user: async (order) => {
            try {
                if (!order || !order.userId) {
                    console.log("Order or order.userId is missing:", order);
                    return null;
                }
                const user = await models_1.User.findByPk(order.userId);
                console.log(`Found user for order ${order.id}:`, user ? user.email : 'null');
                return user;
            }
            catch (error) {
                console.error("Error fetching order user:", error);
                return null;
            }
        },
    },
    // Field resolvers for OrderItem type
    OrderItem: {
        product: async (orderItem) => {
            try {
                const product = await models_1.Product.findByPk(orderItem.productId);
                return product;
            }
            catch (error) {
                console.error("Error fetching order item product:", error);
                return null;
            }
        },
    },
};
