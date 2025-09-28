import { gql } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Product, Cart, Order, OrderItem } from './database/setup';
import { Op } from 'sequelize';

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
        products(category: String, search: String, limit: Int, offset: Int): [Product!]!
        product(id: ID!): Product
        me: User
        cart: [CartItem!]!
        orders: [Order!]!
        users: [User!]! # For admin
    }
    
    type Mutation {
        register(email: String!, password: String!, firstName: String!, lastName: String!, phone: String): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
        
        addToCart(productId: ID!, quantity: Int!): CartItem!
        updateCartQuantity(productId: ID!, quantity: Int!): CartItem!
        removeFromCart(productId: ID!): Boolean!
        clearCart: Boolean!
        
        createOrder(shippingAddress: String!, paymentMethod: String!): Order!
        updateOrderStatus(id: ID!, status: String!): Order!
        
        updateProfile(firstName: String, lastName: String, phone: String): User!
        
        # Admin mutations
        createProduct(name: String!, description: String, price: Float!, category: String!, image: String, stock: Int!): Product!
        updateProduct(id: ID!, name: String, description: String, price: Float, category: String, image: String, stock: Int): Product!
        deleteProduct(id: ID!): Boolean!
    }
`;

// Authentication middleware
const getUser = async (req: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-123456789');
        const user = await User.findByPk(decoded.userId);
        return user;
    } catch (error) {
        console.log('Token verification failed:', error);
        return null;
    }
};

export const resolvers = {
    Query: {
        products: async (_: any, { category, search, limit = 50, offset = 0 }: any) => {
            try {
                const where: any = {};
                if (category && category !== 'all') {
                    where.category = category;
                }
                if (search) {
                    where[Op.or] = [
                        { name: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } }
                    ];
                }
                
                const products = await Product.findAll({ 
                    where, 
                    limit: Math.min(limit, 100), // Cap at 100
                    offset: Math.max(offset, 0),
                    order: [['createdAt', 'DESC']]
                });
                
                return products;
            } catch (error) {
                console.error('Error fetching products:', error);
                throw new Error('Failed to fetch products');
            }
        },
        
        product: async (_: any, { id }: any) => {
            try {
                const product = await Product.findByPk(id);
                if (!product) {
                    throw new Error('Product not found');
                }
                return product;
            } catch (error) {
                console.error('Error fetching product:', error);
                throw new Error('Failed to fetch product');
            }
        },
        
        me: async (_: any, __: any, { req }: any) => {
            return getUser(req);
        },
        
        cart: async (_: any, __: any, { req }: any) => {
            const user = await getUser(req);
            if (!user) throw new Error('Not authenticated');
            
            try {
                return Cart.findAll({
                    where: { userId: user.id },
                    include: [{ model: Product }],
                    order: [['createdAt', 'DESC']]
                });
            } catch (error) {
                console.error('Error fetching cart:', error);
                throw new Error('Failed to fetch cart');
            }
        },
        
        orders: async (_: any, __: any, { req }: any) => {
            const user = await getUser(req);
            if (!user) throw new Error('Not authenticated');
            
            try {
                return Order.findAll({
                    where: { userId: user.id },
                    include: [
                        { model: User },
                        { 
                            model: OrderItem, 
                            include: [{ model: Product }]
                        }
                    ],
                    order: [['createdAt', 'DESC']]
                });
            } catch (error) {
                console.error('Error fetching orders:', error);
                throw new Error('Failed to fetch orders');
            }
        },
        
        users: async (_: any, __: any, { req }: any) => {
            const user = await getUser(req);
            if (!user || user.role !== 'admin') {
                throw new Error('Admin access required');
            }
            
            try {
                return User.findAll({
                    order: [['createdAt', 'DESC']]
                });
            } catch (error) {
                console.error('Error fetching users:', error);
                throw new Error('Failed to fetch users');
            }
        }
    },
    
    Mutation: {
        register: async (_: any, { email, password, firstName, lastName, phone }: any) => {
            try {
                // Validate input
                if (!email || !password || !firstName || !lastName) {
                    throw new Error('All required fields must be provided');
                }
                
                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters long');
                }
                
                // Check if user already exists
                const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
                if (existingUser) {
                    throw new Error('User with this email already exists');
                }
                
                // Hash password
                const hashedPassword = await bcrypt.hash(password, 12);
                
                // Create user
                const user = await User.create({
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: phone ? phone.trim() : null,
                    role: 'customer'
                });
                
                // Generate token
                const token = jwt.sign(
                    { userId: user.id },
                    process.env.JWT_SECRET || 'your-secret-key-123456789',
                    { expiresIn: '7d' }
                );
                
                console.log('✅ New user registered:', user.email);
                return { token, user };
                
            } catch (error: any) {
                console.error('Registration error:', error);
                throw new Error(error.message || 'Registration failed');
            }
        },
        
        login: async (_: any, { email, password }: any) => {
            try {
                // Validate input
                if (!email || !password) {
                    throw new Error('Email and password are required');
                }
                
                // Find user
                const user = await User.findOne({ 
                    where: { email: email.toLowerCase().trim() } 
                });
                
                if (!user) {
                    throw new Error('Invalid email or password');
                }
                
                // Check password
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    throw new Error('Invalid email or password');
                }
                
                // Generate token
                const token = jwt.sign(
                    { userId: user.id },
                    process.env.JWT_SECRET || 'your-secret-key-123456789',
                    { expiresIn: '7d' }
                );
                
                console.log('✅ User logged in:', user.email);
                return { token, user };
                
            } catch (error: any) {
                console.error('Login error:', error);
                throw new Error(error.message || 'Login failed');
            }
        },
        
        addToCart: async (_: any, { productId, quantity }: any, { req }: any) => {
            const user = await getUser(req);
            if (!user) throw new Error('Not authenticated');
            
            try {
                const product = await Product.findByPk(productId);
                if (!product) throw new Error('Product not found');
                
                if (product.stock < quantity) {
                    throw new Error('Not enough stock available');
                }
                
                // Check if item already exists in cart
                const existingCartItem = await Cart.findOne({
                    where: { userId: user.id, productId }
                });
                
                if (existingCartItem) {
                    existingCartItem.quantity += quantity;
                    await existingCartItem.save();
                    return Cart.findByPk(existingCartItem.id, {
                        include: [{ model: Product }]
                    });
                } else {
                    const cartItem = await Cart.create({
                        userId: user.id,
                        productId,
                        quantity
                    });
                    return Cart.findByPk(cartItem.id, {
                        include: [{ model: Product }]
                    });
                }
            } catch (error: any) {
                console.error('Add to cart error:', error);
                throw new Error(error.message || 'Failed to add item to cart');
            }
        },
        
        updateCartQuantity: async (_: any, { productId, quantity }: any, { req }: any) => {
            const user = await getUser(req);
            if (!user) throw new Error('Not authenticated');
            
            try {
                const cartItem = await Cart.findOne({
                    where: { userId: user.id, productId }
                });
                
                if (!cartItem) throw new Error('Cart item not found');
                
                if (quantity <= 0) {
                    await cartItem.destroy();
                    return null;
                }
                
                cartItem.quantity = quantity;
                await cartItem.save();
                
                return Cart.findByPk(cartItem.id, {
                    include: [{ model: Product }]
                });
            } catch (error: any) {
                console.error('Update cart error:', error);
                throw new Error(error.message || 'Failed to update cart item');
            }
        },
        
        removeFromCart: async (_: any, { productId }: any, { req }: any) => {
            const user = await getUser(req);
            if (!user) throw new Error('Not authenticated');
            
            try {
                const cartItem = await Cart.findOne({
                    where: { userId: user.id, productId }
                });
                
                if (!cartItem) throw new Error('Cart item not found');
                
                await cartItem.destroy();
                return true;
            } catch (error: any) {
                console.error('Remove from cart error:', error);
                throw new Error(error.message || 'Failed to remove item from cart');
            }
        },
        
        clearCart: async (_: any, __: any, { req }: any) => {
            const user = await getUser(req);
            if (!user) throw new Error('Not authenticated');
            
            try {
                await Cart.destroy({ where: { userId: user.id } });
                return true;
            } catch (error: any) {
                console.error('Clear cart error:', error);
                throw new Error('Failed to clear cart');
            }
        },
        
        createOrder: async (_: any, { shippingAddress, paymentMethod }: any, { req }: any) => {
            const user = await getUser(req);
            if (!user) throw new Error('Not authenticated');
            
            try {
                // Get cart items with proper includes
                const cartItems = await Cart.findAll({
                    where: { userId: user.id },
                    include: [{ model: Product }]
                });
                
                if (cartItems.length === 0) {
                    throw new Error('Cart is empty');
                }
                
                // Calculate total - FIX: Access product properly
                let total = 0;
                for (const item of cartItems) {
                    const product = item.productId || item.productId; // Handle both possible names
                    if (product && product.price) {
                        total += parseFloat(product.price.toString()) * item.quantity;
                    }
                }
                
                // Add tax (8.5%)
                const tax = total * 0.085;
                // Add shipping (free over ₹50)
                const shipping = total > 50 ? 0 : 5.99;
                total = total + tax + shipping;
                
                // Create order
                const order = await Order.create({
                    userId: user.id,
                    total,
                    status: 'pending',
                    shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
                    paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : JSON.stringify(paymentMethod)
                });
                
                // Create order items - FIX: Access product properly
                for (const cartItem of cartItems) {
                    const product = cartItem.productId || cartItem.productId;
                    if (product) {
                        await OrderItem.create({
                            orderId: order.id,
                            productId: cartItem.productId,
                            quantity: cartItem.quantity,
                            price: parseFloat(product.price.toString())
                        });
                        
                        // Update product stock
                        const productToUpdate = await Product.findByPk(cartItem.productId);
                        if (productToUpdate) {
                            productToUpdate.stock -= cartItem.quantity;
                            await productToUpdate.save();
                        }
                    }
                }
                
                // Clear cart
                await Cart.destroy({ where: { userId: user.id } });
                
                // Return order with items
                return Order.findByPk(order.id, {
                    include: [
                        { model: User },
                        { 
                            model: OrderItem,
                            include: [{ model: Product }]
                        }
                    ]
                });
            } catch (error: any) {
                console.error('Create order error:', error);
                throw new Error(error.message || 'Failed to create order');
            }
        },
        
        updateOrderStatus: async (_: any, { id, status }: any, { req }: any) => {
            const user = await getUser(req);
            if (!user) throw new Error('Not authenticated');
            
            try {
                const order = await Order.findByPk(id);
                if (!order) throw new Error('Order not found');
                
                // Only allow users to cancel their own orders or admins to update any order
                if (order.userId !== user.id && user.role !== 'admin') {
                    throw new Error('Not authorized');
                }
                
                order.status = status;
                await order.save();
                
                return Order.findByPk(order.id, {
                    include: [
                        { model: User },
                        { 
                            model: OrderItem,
                            include: [{ model: Product }]
                        }
                    ]
                });
            } catch (error: any) {
                console.error('Update order error:', error);
                throw new Error(error.message || 'Failed to update order status');
            }
        },
        
        updateProfile: async (_: any, { firstName, lastName, phone }: any, { req }: any) => {
            const user = await getUser(req);
            if (!user) throw new Error('Not authenticated');
            
            try {
                if (firstName) user.firstName = firstName.trim();
                if (lastName) user.lastName = lastName.trim();
                if (phone !== undefined) user.phone = phone ? phone.trim() : null;
                
                await user.save();
                return user;
            } catch (error: any) {
                console.error('Update profile error:', error);
                throw new Error(error.message || 'Failed to update profile');
            }
        },
        
        // Admin mutations
        createProduct: async (_: any, { name, description, price, category, image, stock }: any, { req }: any) => {
            const user = await getUser(req);
            if (!user || user.role !== 'admin') {
                throw new Error('Admin access required');
            }
            
            try {
                const product = await Product.create({
                    name: name.trim(),
                    description: description ? description.trim() : null,
                    price,
                    category,
                    image: image || null,
                    stock
                });
                
                console.log('✅ Admin created product:', product.name);
                return product;
            } catch (error: any) {
                console.error('Create product error:', error);
                throw new Error(error.message || 'Failed to create product');
            }
        },
        
        updateProduct: async (_: any, { id, name, description, price, category, image, stock }: any, { req }: any) => {
            const user = await getUser(req);
            if (!user || user.role !== 'admin') {
                throw new Error('Admin access required');
            }
            
            try {
                const product = await Product.findByPk(id);
                if (!product) throw new Error('Product not found');
                
                if (name) product.name = name.trim();
                if (description !== undefined) product.description = description ? description.trim() : null;
                if (price !== undefined) product.price = price;
                if (category) product.category = category;
                if (image !== undefined) product.image = image || null;
                if (stock !== undefined) product.stock = stock;
                
                await product.save();
                return product;
            } catch (error: any) {
                console.error('Update product error:', error);
                throw new Error(error.message || 'Failed to update product');
            }
        },
        
        deleteProduct: async (_: any, { id }: any, { req }: any) => {
            const user = await getUser(req);
            if (!user || user.role !== 'admin') {
                throw new Error('Admin access required');
            }
            
            try {
                const product = await Product.findByPk(id);
                if (!product) throw new Error('Product not found');
                
                await product.destroy();
                console.log('✅ Admin deleted product:', product.name);
                return true;
            } catch (error: any) {
                console.error('Delete product error:', error);
                throw new Error(error.message || 'Failed to delete product');
            }
        }
    }
};