"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDatabase = setupDatabase;
const sequelize_1 = __importDefault(require("./sequelize"));
const models_1 = require("./models");
const models_2 = require("./models");
const models_3 = require("./models");
const models_4 = require("./models");
const models_5 = require("./models");
const models_6 = require("./models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
(0, models_1.initUserModel)(sequelize_1.default);
(0, models_2.initProductModel)(sequelize_1.default);
(0, models_3.initCartItemModel)(sequelize_1.default);
(0, models_4.initOrderModel)(sequelize_1.default);
(0, models_5.initOrderItemModel)(sequelize_1.default);
(0, models_6.initAddressModel)(sequelize_1.default);
// Define associations
models_1.User.hasMany(models_4.Order, { foreignKey: 'userId' });
models_4.Order.belongsTo(models_1.User, { foreignKey: 'userId' });
models_2.Product.hasMany(models_3.CartItem, { foreignKey: 'productId' });
models_3.CartItem.belongsTo(models_2.Product, { foreignKey: 'productId' });
models_2.Product.hasMany(models_5.OrderItem, { foreignKey: 'productId' });
models_5.OrderItem.belongsTo(models_2.Product, { foreignKey: 'productId' });
models_1.User.hasMany(models_3.CartItem, { foreignKey: 'userId' });
models_3.CartItem.belongsTo(models_1.User, { foreignKey: 'userId' });
models_4.Order.hasMany(models_5.OrderItem, { foreignKey: 'orderId' });
models_5.OrderItem.belongsTo(models_4.Order, { foreignKey: 'orderId' });
models_1.User.hasMany(models_6.Address, { foreignKey: 'userId' });
models_6.Address.belongsTo(models_1.User, { foreignKey: 'userId' });
async function setupDatabase() {
    try {
        await sequelize_1.default.authenticate();
        console.log("Connection to MySQL has been established successfully.");
        // --------------------------------------------------------------------------------------------------------------------------------------------------
        // Make sure schema is up-to-date (adds new columns like Product.images without dropping data)
        await sequelize_1.default.sync({ alter: true });
        // Check if tables have data
        const userCount = await models_1.User.count();
        const productCount = await models_2.Product.count();
        if (productCount === 0) {
            console.log("No products found, inserting demo data...");
            // Insert demo users with hashed passwords
            const hashedAdminPassword = await bcryptjs_1.default.hash("admin123", 12);
            const hashedCustomerPassword = await bcryptjs_1.default.hash("customer123", 12);
            if (userCount === 0) {
                await models_1.User.create({
                    id: (0, uuid_1.v4)(),
                    email: "admin@shopzone.com",
                    password: hashedAdminPassword,
                    firstName: "Admin",
                    lastName: "User",
                    phone: null,
                    role: "admin",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                await models_1.User.create({
                    id: (0, uuid_1.v4)(),
                    email: "customer@shopzone.com",
                    password: hashedCustomerPassword,
                    firstName: "Customer",
                    lastName: "User",
                    phone: null,
                    role: "customer",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            // Insert sample products
            const products = [
                {
                    id: (0, uuid_1.v4)(),
                    name: "Wireless Bluetooth Headphones",
                    description: "High-quality wireless headphones with noise cancellation",
                    price: 99.99,
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                    stock: 50,
                },
                {
                    id: (0, uuid_1.v4)(),
                    name: "Smart Watch",
                    description: "Fitness tracking smartwatch with heart rate monitor",
                    price: 199.99,
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
                    stock: 30,
                },
                {
                    id: (0, uuid_1.v4)(),
                    name: "Running Shoes",
                    description: "Comfortable running shoes for all terrains",
                    price: 79.99,
                    category: "Sports",
                    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                    stock: 100,
                },
                {
                    id: (0, uuid_1.v4)(),
                    name: "Coffee Maker",
                    description: "Programmable coffee maker with thermal carafe",
                    price: 49.99,
                    category: "Home",
                    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
                    stock: 25,
                },
                {
                    id: (0, uuid_1.v4)(),
                    name: "Yoga Mat",
                    description: "Non-slip yoga mat for home workouts",
                    price: 29.99,
                    category: "Sports",
                    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
                    stock: 75,
                },
                {
                    id: (0, uuid_1.v4)(),
                    name: "Laptop Stand",
                    description: "Adjustable laptop stand for better ergonomics",
                    price: 39.99,
                    category: "Electronics",
                    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
                    stock: 40,
                },
            ];
            for (const product of products) {
                await models_2.Product.create({
                    ...product, // (...): Merge existing options
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            console.log("Demo data insertion completed.");
        }
        else {
            // console.log(`Database already has ${userCount} users and ${productCount} products. Skipping demo data insertion.`);
        }
        // console.log("Database setup completed.");
    }
    catch (error) {
        console.error("Unable to connect to the database or setup data:", error);
    }
}
