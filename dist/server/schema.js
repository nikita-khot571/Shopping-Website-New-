"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const operations_1 = require("./database/operations");
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
    users: [User!]! # For admin
    allOrders: [Order!]! # For admin
    adminProducts: [Product!]! # For admin
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

    # Admin mutations
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
        const user = await operations_1.User.findByPk(decoded.userId);
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
                const products = await operations_1.Product.findAll({
                    where,
                    limit: Math.min(limit, 100), // Cap at 100
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
                const product = await operations_1.Product.findByPk(id);
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
                return operations_1.Cart.findAll({
                    where: { userId: user.id },
                    include: [{ model: operations_1.Product }],
                });
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
                return operations_1.Order.findAll({
                    where: { userId: user.id },
                    include: [
                        { model: operations_1.User },
                        {
                            model: operations_1.OrderItem,
                            include: [{ model: operations_1.Product }],
                        },
                    ],
                    order: [["createdAt", "DESC"]],
                });
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
                return operations_1.User.findAll({
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
                throw new Error("Admin access required");
            }
            try {
                return operations_1.Order.findAll({
                    include: [
                        { model: operations_1.User },
                        {
                            model: operations_1.OrderItem,
                            include: [{ model: operations_1.Product }],
                        },
                    ],
                    order: [["createdAt", "DESC"]],
                });
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
                // Get distinct categories by fetching all products and extracting categories
                const allProducts = await operations_1.Product.findAll();
                const categories = [...new Set(allProducts.map(p => p.category))];
                // Fetch up to 6 products from each category
                const products = [];
                for (const category of categories) {
                    const categoryProducts = await operations_1.Product.findAll({
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
                // Validate input
                if (!email || !password || !firstName || !lastName) {
                    throw new Error("All required fields must be provided");
                }
                if (password.length < 6) {
                    throw new Error("Password must be at least 6 characters long");
                }
                // Check if user already exists
                const existingUser = await operations_1.User.findOne({
                    where: { email: email.toLowerCase() },
                });
                if (existingUser) {
                    throw new Error("User with this email already exists");
                }
                // Hash password
                const hashedPassword = await bcryptjs_1.default.hash(password, 12);
                // Create user
                const user = await operations_1.User.create({
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone ? phone.trim() : null,
                    role: "customer",
                });
                // Generate token
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
                // Validate input
                if (!email || !password) {
                    throw new Error("Email and password are required");
                }
                // Find user
                const user = await operations_1.User.findOne({
                    where: { email: email.toLowerCase().trim() },
                });
                if (!user) {
                    throw new Error("Invalid email or password");
                }
                // Check password
                const isValid = await bcryptjs_1.default.compare(password, user.password);
                if (!isValid) {
                    throw new Error("Invalid email or password");
                }
                // Generate token
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
                const product = await operations_1.Product.findByPk(productId);
                if (!product)
                    throw new Error("Product not found");
                if (product.stock < quantity) {
                    throw new Error("Not enough stock available");
                }
                // Check if item already exists in cart
                const existingCartItem = await operations_1.Cart.findOne({
                    where: { userId: user.id, productId },
                });
                if (existingCartItem) {
                    existingCartItem.quantity += quantity;
                    await operations_1.Cart.save(existingCartItem);
                    return existingCartItem;
                }
                else {
                    const cartItem = await operations_1.Cart.create({
                        userId: user.id,
                        productId,
                        quantity,
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
                const cartItem = await operations_1.Cart.findOne({
                    where: { userId: user.id, productId },
                });
                if (!cartItem)
                    throw new Error("Cart item not found");
                if (quantity <= 0) {
                    await operations_1.Cart.destroy({ where: { userId: user.id, productId } });
                    return null;
                }
                cartItem.quantity = quantity;
                await operations_1.Cart.save(cartItem);
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
                await operations_1.Cart.destroy({ where: { userId: user.id, productId } });
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
                await operations_1.Cart.destroy({ where: { userId: user.id } });
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
                const cartItems = await operations_1.Cart.findAll({
                    where: { userId: user.id },
                    include: [{ model: operations_1.Product, as: "Product" }],
                });
                if (cartItems.length === 0) {
                    throw new Error("Cart is empty");
                }
                // Calculate total - FIX: Properly access Product association
                let total = 0;
                for (const item of cartItems) {
                    const product = await operations_1.Product.findByPk(item.productId);
                    if (product) {
                        total += parseFloat(String(product.price)) * item.quantity;
                    }
                }
                // Add tax and shipping
                const tax = total * 0.085;
                const shipping = total > 50 ? 0 : 5.99;
                total = total + tax + shipping;
                // Create order
                const order = await operations_1.Order.create({
                    userId: user.id,
                    total: total,
                    status: "pending",
                    shippingAddress: typeof shippingAddress === "string"
                        ? shippingAddress
                        : JSON.stringify(shippingAddress),
                    paymentMethod: typeof paymentMethod === "string"
                        ? paymentMethod
                        : JSON.stringify(paymentMethod),
                });
                // Create order items
                for (const cartItem of cartItems) {
                    const product = await operations_1.Product.findByPk(cartItem.productId);
                    if (product) {
                        await operations_1.OrderItem.create({
                            orderId: order.id,
                            productId: cartItem.productId,
                            quantity: cartItem.quantity,
                            price: parseFloat(String(product.price)),
                        });
                        // Update stock
                        product.stock -= cartItem.quantity;
                        await operations_1.Product.save(product);
                    }
                }
                // Clear cart
                await operations_1.Cart.destroy({ where: { userId: user.id } });
                // Return order with associations
                return await operations_1.Order.findByPk(order.id, {
                    include: [
                        { model: operations_1.User },
                        {
                            model: operations_1.OrderItem,
                            include: [{ model: operations_1.Product }],
                        },
                    ],
                });
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
                const order = await operations_1.Order.findByPk(id);
                if (!order)
                    throw new Error("Order not found");
                // Only allow users to cancel their own orders or admins to update any order
                if (order.userId !== user.id && user.role !== "admin") {
                    throw new Error("Not authorized");
                }
                order.status = status;
                await operations_1.Order.save(order);
                return operations_1.Order.findByPk(order.id, {
                    include: [
                        { model: operations_1.User },
                        {
                            model: operations_1.OrderItem,
                            include: [{ model: operations_1.Product }],
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
                const updateData = {};
                if (firstName)
                    updateData.firstName = firstName.trim();
                if (lastName)
                    updateData.lastName = lastName.trim();
                if (phone !== undefined)
                    updateData.phone = phone ? phone.trim() : null;
                await operations_1.User.save({ ...user, ...updateData });
                return await operations_1.User.findByPk(user.id);
            }
            catch (error) {
                console.error("Update profile error:", error);
                throw new Error(error.message || "Failed to update profile");
            }
        },
        // Admin mutations
        createProduct: async (_, { name, description, price, category, image, stock }, { req }) => {
            const user = await getUser(req);
            if (!user || user.role !== "admin") {
                throw new Error("Admin access required");
            }
            try {
                const product = await operations_1.Product.create({
                    name: name.trim(),
                    description: description ? description.trim() : null,
                    price,
                    category,
                    image: image || null,
                    stock,
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
                const product = await operations_1.Product.findByPk(id);
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
                await operations_1.Product.save(product);
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
                const product = await operations_1.Product.findByPk(id);
                if (!product)
                    throw new Error("Product not found");
                await operations_1.Product.destroy({ where: { id } });
                console.log("✅ Admin deleted product:", product.name);
                return true;
            }
            catch (error) {
                console.error("Delete product error:", error);
                throw new Error(error.message || "Failed to delete product");
            }
        },
    },
};
