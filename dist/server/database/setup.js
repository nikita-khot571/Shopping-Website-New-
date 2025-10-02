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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const DB_PATH = path_1.default.join(__dirname, "../../db.json");
(0, models_1.initUserModel)(sequelize_1.default);
(0, models_2.initProductModel)(sequelize_1.default);
(0, models_3.initCartItemModel)(sequelize_1.default);
(0, models_4.initOrderModel)(sequelize_1.default);
(0, models_5.initOrderItemModel)(sequelize_1.default);
async function setupDatabase() {
    try {
        await sequelize_1.default.authenticate();
        console.log("Connection to MySQL has been established successfully.");
        await sequelize_1.default.sync({ force: true }); // Drops and recreates tables
        // Migrate data from db.json
        const rawData = fs_1.default.readFileSync(DB_PATH, "utf-8");
        const data = JSON.parse(rawData);
        // Insert users
        for (const user of data.users) {
            await models_1.User.create({
                id: user.id || (0, uuid_1.v4)(),
                email: user.email,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        // Insert products
        for (const product of data.products) {
            await models_2.Product.create({
                id: product.id || (0, uuid_1.v4)(),
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                image: product.image,
                stock: product.stock,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
        // TODO: Migrate cart items, orders, order items if present in db.json
        console.log("Database setup and data migration completed.");
    }
    catch (error) {
        console.error("Unable to connect to the database or migrate data:", error);
    }
}
