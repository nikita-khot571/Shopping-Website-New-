import { gql } from "apollo-server-express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Product, CartItem as Cart, Order, OrderItem, Address } from "./database/models";
import { v4 as uuidv4 } from "uuid";

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phone: String
    role: String!
    createdAt: String!
    updatedAt: String!
    addresses: [Address!]
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    category: String!
    image: String
    images: [String]
    stock: Int!
    createdAt: String!
    updatedAt: String!
  }

  type CartItem {
    id: ID!
    userId: ID!
    productId: ID!
    quantity: Int!
    product: Product
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

  type Address {
    id: ID!
    userId: ID!
    label: String!
    firstName: String!
    lastName: String!
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
    isDefault: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input AddressInput {
    label: String!
    firstName: String!
    lastName: String!
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
    isDefault: Boolean
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
    addresses: [Address!]!
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
      images: [String]
      stock: Int!
    ): Product!
    updateProduct(
      id: ID!
      name: String
      description: String
      price: Float
      category: String
      image: String
      images: [String]
      stock: Int
    ): Product!
    deleteProduct(id: ID!): Boolean!

    addAddress(input: AddressInput!): Address!
    updateAddress(id: ID!, input: AddressInput!): Address!
    deleteAddress(id: ID!): Boolean!
  }
`;

// Authentication middleware
const getUser = async (req: any) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-123456789"
    );
    const user = await User.findByPk(decoded.userId);
    return user;
  } catch (error) {
    console.log("Token verification failed:", error);
    return null;
  }
};

export const resolvers = {
  Query: {
    products: async (
      _: any,
      { category, search, limit = 50, offset = 0 }: any
    ) => {
      try {
        const where: any = {};
        if (category && category !== "all") {
          where.category = category;
        }
        if (search) {
          where.name = { [require('sequelize').Op.iLike]: `%${search}%` };
        }

        const products = await Product.findAll({
          where,
          limit: Math.min(limit, 100),
          offset: Math.max(offset, 0),
        });

        return products;
      } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
      }
    },

    product: async (_: any, { id }: any) => {
      try {
        const product = await Product.findByPk(id);
        if (!product) {
          throw new Error("Product not found");
        }
        return product;
      } catch (error) {
        console.error("Error fetching product:", error);
        throw new Error("Failed to fetch product");
      }
    },

    me: async (_: any, __: any, { req }: any) => {
      return getUser(req);
    },

    cart: async (_: any, __: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");

      try {
        const cartItems = await Cart.findAll({
          where: { userId: user.id },
          include: [
            { 
              model: Product,
              required: false // LEFT JOIN instead of INNER JOIN
            }
          ],
        });

        // Filter out cart items with deleted/missing products
        const validCartItems = cartItems.filter(item => {
          const product = (item as any).Product || (item as any).product;
          return product !== null && product !== undefined;
        });

        // Clean up orphaned cart items (items with deleted products)
        const orphanedItems = cartItems.filter(item => {
          const product = (item as any).Product || (item as any).product;
          return product === null || product === undefined;
        });

        if (orphanedItems.length > 0) {
          const orphanedIds = orphanedItems.map(item => item.id);
          await Cart.destroy({
            where: {
              id: orphanedIds
            }
          });
          console.log(`🧹 Cleaned up ${orphanedItems.length} orphaned cart items`);
        }

        return validCartItems;
      } catch (error) {
        console.error("Error fetching cart:", error);
        throw new Error("Failed to fetch cart");
      }
    },

    orders: async (_: any, __: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");

      try {
        const orders = await Order.findAll({
          where: { userId: user.id },
          order: [["createdAt", "DESC"]],
        });

        return orders;
      } catch (error) {
        console.error("Error fetching orders:", error);
        throw new Error("Failed to fetch orders");
      }
    },

    users: async (_: any, __: any, { req }: any) => {
      const user = await getUser(req);
      if (!user || user.role !== "admin") {
        throw new Error("Admin access required");
      }

      try {
        return User.findAll({
          order: [["createdAt", "DESC"]],
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
      }
    },

    allOrders: async (_: any, __: any, { req }: any) => {
      const user = await getUser(req);
      if (!user || user.role !== "admin") {
        console.log("Admin access required - user:", user ? user.email : 'null', 'role:', user ? user.role : 'null');
        throw new Error("Admin access required");
      }

      try {
       //  console.log("Fetching all orders for admin:", user.email);
        const orders = await Order.findAll({
          order: [["createdAt", "DESC"]],
        });

      //   console.log(`Found ${orders.length} orders`);
        return orders;
      } catch (error) {
        console.error("Error fetching all orders:", error);
        throw new Error("Failed to fetch all orders");
      }
    },

    adminProducts: async (_: any, __: any, { req }: any) => {
      const user = await getUser(req);
      if (!user || user.role !== "admin") {
        throw new Error("Admin access required");
      }

      try {
        const allProducts = await Product.findAll();
        const categories = [...new Set(allProducts.map(p => p.category))];
        const products = [];
        for (const category of categories) {
          const categoryProducts = await Product.findAll({
            where: { category },
            limit: 6
          });
          products.push(...categoryProducts);
        }
        return products;
      } catch (error) {
        console.error("Error fetching admin products:", error);
        throw new Error("Failed to fetch products");
      }
    },

    addresses: async (_: any, __: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");
      return Address.findAll({ where: { userId: user.id }, order: [["createdAt", "DESC"]] });
    },
  },

  Mutation: {
    register: async (
      _: any,
      { email, password, firstName, lastName, phone }: any
    ) => {
      try {
        if (!email || !password || !firstName || !lastName) {
          throw new Error("All required fields must be provided");
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        const existingUser = await User.findOne({
          where: { email: email.toLowerCase() },
        });
        if (existingUser) {
          throw new Error("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const now = new Date();
        const user = await User.create({
          id: uuidv4(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : null,
          role: "customer",
          createdAt: now,
          updatedAt: now,
        });

        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || "your-secret-key-123456789",
          { expiresIn: "7d" }
        );

        console.log("✅ New user registered:", user.email);
        return { token, user };
      } catch (error: any) {
        console.error("Registration error:", error);
        throw new Error(error.message || "Registration failed");
      }
    },

    login: async (_: any, { email, password }: any) => {
      try {
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const user = await User.findOne({
          where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET || "your-secret-key-123456789",
          { expiresIn: "7d" }
        );

        console.log("✅ User logged in:", user.email);
        return { token, user };
      } catch (error: any) {
        console.error("Login error:", error);
        throw new Error(error.message || "Login failed");
      }
    },

    addToCart: async (_: any, { productId, quantity }: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");

      try {
        const product = await Product.findByPk(productId);
        if (!product) throw new Error("Product not found");

        if (product.stock < quantity) {
          throw new Error("Not enough stock available");
        }

        const existingCartItem = await Cart.findOne({
          where: { userId: user.id, productId },
        });

        if (existingCartItem) {
          existingCartItem.quantity += quantity;
          await existingCartItem.save();
          return existingCartItem;
        } else {
          const cartItem = await Cart.create({
            id: uuidv4(),
            userId: user.id,
            productId,
            quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          return cartItem;
        }
      } catch (error: any) {
        console.error("Add to cart error:", error);
        throw new Error(error.message || "Failed to add item to cart");
      }
    },

    updateCartQuantity: async (
      _: any,
      { productId, quantity }: any,
      { req }: any
    ) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");

      try {
        const cartItem = await Cart.findOne({
          where: { userId: user.id, productId },
        });

        if (!cartItem) throw new Error("Cart item not found");

        if (quantity <= 0) {
          await Cart.destroy({ where: { userId: user.id, productId } });
          return null;
        }

        cartItem.quantity = quantity;
        await cartItem.save();
        return cartItem;
      } catch (error: any) {
        console.error("Update cart error:", error);
        throw new Error(error.message || "Failed to update cart item");
      }
    },

    removeFromCart: async (_: any, { productId }: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");

      try {
        await Cart.destroy({ where: { userId: user.id, productId } });
        return true;
      } catch (error: any) {
        console.error("Remove from cart error:", error);
        throw new Error(error.message || "Failed to remove item from cart");
      }
    },

    clearCart: async (_: any, __: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");

      try {
        await Cart.destroy({ where: { userId: user.id } });
        return true;
      } catch (error: any) {
        console.error("Clear cart error:", error);
        throw new Error("Failed to clear cart");
      }
    },

    logout: async (_: any, __: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");

      try {
        const roleLabel = user.role === "admin" ? "Admin" : "User";
        console.log(`✅ ${roleLabel} logged out: ${user.email}`);
        return true;
      } catch (error: any) {
        console.error("Logout error:", error);
        throw new Error("Failed to logout");
      } 
    },

    createOrder: async (
      _: any,
      { shippingAddress, paymentMethod }: any,
      { req }: any
    ) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");

      try {
        // Get fresh cart items with product association (only those still present)
        const cartItems = await Cart.findAll({
          where: { userId: user.id },
          include: [
            {
              model: Product,
              required: false
            }
          ],
        });

        // Filter valid cart items (with existing products)
        // Also coalesce duplicate productIds by summing quantities, in case of rapid client updates
        const validCartItems = cartItems.filter(item => {
          const product = (item as any).Product || (item as any).product;
          return product !== null && product !== undefined;
        });

        // Collapse duplicates (defensive)
        const byProduct: Record<string, any> = {};
        for (const item of validCartItems) {
          const key = String((item as any).productId);
          if (!byProduct[key]) {
            byProduct[key] = item;
          } else {
            byProduct[key].quantity += (item as any).quantity;
          }
        }
        const itemsNormalized = Object.values(byProduct);

        if (validCartItems.length === 0) {
          // Clean up any orphaned cart items
          await Cart.destroy({ where: { userId: user.id } });
          throw new Error("Cart is empty");
        }

        // Calculate total
        let subtotal = 0;
        const itemsToProcess = [];

        for (const item of itemsNormalized as any[]) {
          const product = await Product.findByPk(item.productId);
          
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
        const shipping = subtotal > 500 ? 0 : 5.99; // Free shipping over 500
        const total = subtotal + tax + shipping;

        // Create order
        const order = await Order.create({
          id: uuidv4(),
          userId: user.id,
          total: total,
          status: "pending",
          shippingAddress:
            typeof shippingAddress === "string"
              ? shippingAddress
              : JSON.stringify(shippingAddress),
          paymentMethod:
            typeof paymentMethod === "string"
              ? paymentMethod
              : JSON.stringify(paymentMethod),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`📦 Creating order ${order.id} with ${itemsToProcess.length} items`);

        // Create order items and update stock
        for (const { cartItem, product } of itemsToProcess) {
          await OrderItem.create({
            id: uuidv4(),
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

        // Clear entire cart once order is created
        await Cart.destroy({ where: { userId: user.id } });
        console.log(`🧹 Cart cleared for user ${user.email}`);

        // Return order with all associations
        const createdOrder = await Order.findByPk(order.id, {
          include: [
            { model: User },
            {
              model: OrderItem,
              include: [{ model: Product }],
            },
          ],
        });

        console.log(`✅ Order ${order.id} created successfully`);
        return createdOrder;
      } catch (error: any) {
        console.error("Create order error:", error);
        throw new Error(error.message || "Failed to create order");
      }
    },

    updateOrderStatus: async (_: any, { id, status }: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");

      try {
        const order = await Order.findByPk(id);
        if (!order) throw new Error("Order not found");

        if (order.userId !== user.id && user.role !== "admin") {
          throw new Error("Not authorized");
        }

        // Restrict customer to cancel only. Admin can set any status.
        if (user.role !== "admin") {
          const normalized = String(status).toLowerCase();
          if (normalized !== "cancelled" && normalized !== "customer_cancelled") {
            throw new Error("Customers can only cancel their orders");
          }
          order.status = "customer_cancelled"; // use explicit customer status
        } else {
          order.status = status;
        }
        await order.save();

        return Order.findByPk(order.id, {
          include: [
            { model: User },
            {
              model: OrderItem,
              include: [{ model: Product }],
            },
          ],
        });
      } catch (error: any) {
        console.error("Update order error:", error);
        throw new Error(error.message || "Failed to update order status");
      }
    },

    updateProfile: async (
      _: any,
      { firstName, lastName, phone }: any,
      { req }: any
    ) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");

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
        const updatedUser = await User.findByPk(user.id);
        
        console.log("✅ Profile updated for user:", updatedUser?.email);
        return updatedUser;
      } catch (error: any) {
        console.error("Update profile error:", error);
        throw new Error(error.message || "Failed to update profile");
      }
    },

    createProduct: async (
      _: any,
      { name, description, price, category, image, images, stock }: any,
      { req }: any
    ) => {
      const user = await getUser(req);
      if (!user || user.role !== "admin") {
        throw new Error("Admin access required");
      }

      try {
        const now = new Date();
        const product = await Product.create({
          id: uuidv4(),
          name: name.trim(),
          description: description ? description.trim() : null,
          price,
          category,
          image: image || null,
          images: Array.isArray(images) ? images.slice(0, 3) : null,
          stock,
          createdAt: now,
          updatedAt: now,
        });

        console.log("✅ Admin created product:", product.name);
        return product;
      } catch (error: any) {
        console.error("Create product error:", error);
        throw new Error(error.message || "Failed to create product");
      }
    },

    updateProduct: async (
      _: any,
      { id, name, description, price, category, image, images, stock }: any,
      { req }: any
    ) => {
      const user = await getUser(req);
      if (!user || user.role !== "admin") {
        throw new Error("Admin access required");
      }

      try {
        const product = await Product.findByPk(id);
        if (!product) throw new Error("Product not found");

        if (name) product.name = name.trim();
        if (description !== undefined)
          product.description = description ? description.trim() : null;
        if (price !== undefined) product.price = price;
        if (category) product.category = category;
        if (image !== undefined) product.image = image || null;
        if (images !== undefined) product.images = Array.isArray(images) ? images.slice(0, 3) : null;
        if (stock !== undefined) product.stock = stock;

        await product.save();
        return product;
      } catch (error: any) {
        console.error("Update product error:", error);
        throw new Error(error.message || "Failed to update product");
      }
    },

    deleteProduct: async (_: any, { id }: any, { req }: any) => {
      const user = await getUser(req);
      if (!user || user.role !== "admin") {
        throw new Error("Admin access required");
      }

      try {
        const product = await Product.findByPk(id);
        if (!product) {
          throw new Error("Product not found");
        }

        // 1. Delete all associated cart items
        await Cart.destroy({ where: { productId: id } });

        // 2. Delete all associated order items
        await OrderItem.destroy({ where: { productId: id } });

        // 3. Delete the product itself
        await Product.destroy({ where: { id } });

        console.log("✅ Admin deleted product:", product.name);
        return true;
      } catch (error: any) {
        console.error("Delete product error:", error);
        throw new Error(error.message || "Failed to delete product");
      }
    },

    addAddress: async (_: any, { input }: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");
      const now = new Date();
      // If setting default, unset all other defaults for this user
      if (input.isDefault) {
        await Address.update({ isDefault: false }, { where: { userId: user.id } });
      }
      const created = await Address.create({
        id: uuidv4(),
        userId: user.id,
        label: input.label,
        firstName: input.firstName,
        lastName: input.lastName,
        street: input.street,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        country: input.country,
        isDefault: !!input.isDefault,
        createdAt: now,
        updatedAt: now,
      });
      return created;
    },

    updateAddress: async (_: any, { id, input }: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");
      const address = await Address.findByPk(id);
      if (!address || (address as any).userId !== user.id) throw new Error("Address not found");
      // If toggling default on, unset others first
      if (input.isDefault === true) {
        await Address.update({ isDefault: false }, { where: { userId: user.id } });
      }
      Object.assign(address, {
        label: input.label,
        firstName: input.firstName,
        lastName: input.lastName,
        street: input.street,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        country: input.country,
        isDefault: input.isDefault ?? (address as any).isDefault,
        updatedAt: new Date(),
      });
      await (address as any).save();
      return address;
    },

    deleteAddress: async (_: any, { id }: any, { req }: any) => {
      const user = await getUser(req);
      if (!user) throw new Error("Not authenticated");
      const deleted = await Address.destroy({ where: { id, userId: user.id } });
      return deleted > 0;
    },
  },

  // Field resolvers for Order type
  Order: {
    items: async (order: any) => {
      try {
        if (!order || !order.id) {
          console.log("Order or order.id is missing:", order);
          return [];
        }
        
        const orderItems = await OrderItem.findAll({
          where: { orderId: order.id },
          include: [{ model: Product }],
        });
        
        // console.log(`Found ${orderItems.length} items for order ${order.id}`);
        return orderItems;
      } catch (error) {
        console.error("Error fetching order items:", error);
        return [];
      }
    },
    user: async (order: any) => {
      try {
        if (!order || !order.userId) {
          console.log("Order or order.userId is missing:", order);
          return null;
        }
        
        const user = await User.findByPk(order.userId);
       //  console.log(`Found user for order ${order.id}:`, user ? user.email : 'null');
        return user;
      } catch (error) {
        console.error("Error fetching order user:", error);
        return null;
      }
    },
  },

  // Field resolvers for OrderItem type
  OrderItem: {
    product: async (orderItem: any) => {
      try {
        const product = await Product.findByPk(orderItem.productId);
        return product;
      } catch (error) {
        console.error("Error fetching order item product:", error);
        return null;
      }
    },
  },
};