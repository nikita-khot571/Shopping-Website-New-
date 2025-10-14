"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = exports.Order = exports.Cart = exports.Product = exports.User = exports.OrderItemModel = exports.OrderModel = exports.CartModel = exports.ProductModel = exports.UserModel = void 0;
const models_1 = require("./models");
const sequelize_1 = require("sequelize");
// Sequelize-based database operations
class UserModel {
    static async findByPk(id) {
        return await models_1.User.findByPk(id);
    }
    static async findOne(options) {
        return await models_1.User.findOne(options);
    }
    static async findAll(options) {
        return await models_1.User.findAll(options);
    }
    static async create(data) {
        return await models_1.User.create(data);
    }
    static async save(user) {
        return await user.save();
    }
}
exports.UserModel = UserModel;
exports.User = UserModel;
class ProductModel {
    static async findByPk(id) {
        return await models_1.Product.findByPk(id);
    }
    static async findAll(options) {
        // Handle search functionality on Home page
        if (options?.where?.name) {
            options.where = {
                ...options.where,
                name: { [sequelize_1.Op.iLike]: `%${options.where.name}%` }
            };
        }
        if (options?.where?.description) {
            options.where = {
                ...options.where,
                description: { [sequelize_1.Op.iLike]: `%${options.where.description}%` }
            };
        }
        return await models_1.Product.findAll(options);
    }
    static async create(data) {
        return await models_1.Product.create(data);
    }
    static async save(product) {
        return await product.save();
    }
    static async destroy(options) {
        return await models_1.Product.destroy(options);
    }
}
exports.ProductModel = ProductModel;
exports.Product = ProductModel;
class CartModel {
    static async findAll(options) {
        return await models_1.CartItem.findAll(options);
    }
    static async findOne(options) {
        return await models_1.CartItem.findOne(options);
    }
    static async create(data) {
        return await models_1.CartItem.create(data);
    }
    static async save(item) {
        return await item.save();
    }
    static async destroy(options) {
        return await models_1.CartItem.destroy(options);
    }
}
exports.CartModel = CartModel;
exports.Cart = CartModel;
class OrderModel {
    static async findAll(options) {
        return await models_1.Order.findAll(options);
    }
    static async findByPk(id, options) {
        return await models_1.Order.findByPk(id, options);
    }
    static async create(data) {
        return await models_1.Order.create(data);
    }
    static async save(order) {
        return await order.save();
    }
}
exports.OrderModel = OrderModel;
exports.Order = OrderModel;
class OrderItemModel {
    static async findAll(options) {
        return await models_1.OrderItem.findAll(options);
    }
    static async create(data) {
        return await models_1.OrderItem.create(data);
    }
}
exports.OrderItemModel = OrderItemModel;
exports.OrderItem = OrderItemModel;
