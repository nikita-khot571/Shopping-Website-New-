"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = exports.OrderItem = exports.Order = exports.CartItem = exports.Product = exports.User = void 0;
exports.initUserModel = initUserModel;
exports.initProductModel = initProductModel;
exports.initCartItemModel = initCartItemModel;
exports.initOrderModel = initOrderModel;
exports.initOrderItemModel = initOrderItemModel;
exports.initAddressModel = initAddressModel;
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
}
exports.User = User;
function initUserModel(sequelize) {
    User.init({
        id: {
            type: sequelize_1.DataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        email: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        password: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        firstName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        lastName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        phone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
        },
        role: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: "users",
        timestamps: false,
    });
}
class Product extends sequelize_1.Model {
}
exports.Product = Product;
function initProductModel(sequelize) {
    Product.init({
        id: {
            type: sequelize_1.DataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        category: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        image: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
        },
        stock: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: "products",
        timestamps: false,
    });
}
class CartItem extends sequelize_1.Model {
}
exports.CartItem = CartItem;
function initCartItemModel(sequelize) {
    CartItem.init({
        id: {
            type: sequelize_1.DataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.STRING(36),
            allowNull: false,
        },
        productId: {
            type: sequelize_1.DataTypes.STRING(36),
            allowNull: false,
        },
        quantity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: "cart_items",
        timestamps: false,
    });
}
class Order extends sequelize_1.Model {
}
exports.Order = Order;
function initOrderModel(sequelize) {
    Order.init({
        id: {
            type: sequelize_1.DataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.STRING(36),
            allowNull: false,
        },
        total: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
        },
        shippingAddress: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        paymentMethod: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: "orders",
        timestamps: false,
    });
}
class OrderItem extends sequelize_1.Model {
}
exports.OrderItem = OrderItem;
function initOrderItemModel(sequelize) {
    OrderItem.init({
        id: {
            type: sequelize_1.DataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        orderId: {
            type: sequelize_1.DataTypes.STRING(36),
            allowNull: false,
        },
        productId: {
            type: sequelize_1.DataTypes.STRING(36),
            allowNull: false,
        },
        quantity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: "order_items",
        timestamps: false,
    });
}
class Address extends sequelize_1.Model {
}
exports.Address = Address;
function initAddressModel(sequelize) {
    Address.init({
        id: {
            type: sequelize_1.DataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.STRING(36),
            allowNull: false,
        },
        label: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        firstName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        lastName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        street: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        city: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        state: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        zipCode: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
        },
        country: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        isDefault: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: "addresses",
        timestamps: false,
    });
}
