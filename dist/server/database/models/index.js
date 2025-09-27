"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = exports.Review = exports.PaymentMethod = exports.Address = exports.OrderItem = exports.Order = exports.CartItem = exports.Cart = exports.Category = exports.Product = exports.User = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = require("../connection");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class User extends sequelize_1.Model {
    async comparePassword(candidatePassword) {
        return bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    toJSON() {
        const values = { ...this.get() };
        delete values.password;
        return values;
    }
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 255]
        }
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('admin', 'customer'),
        defaultValue: 'customer'
    },
    emailVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcryptjs_1.default.hash(user.password, 12);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password') && user.password) {
                user.password = await bcryptjs_1.default.hash(user.password, 12);
            }
        }
    }
});
class Product extends sequelize_1.Model {
}
exports.Product = Product;
Product.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 255]
        }
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    images: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true
    },
    stock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    sku: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    weight: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    dimensions: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true
    },
    tags: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    modelName: 'Product',
    tableName: 'products'
});
class Category extends sequelize_1.Model {
}
exports.Category = Category;
Category.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    parentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    sortOrder: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    modelName: 'Category',
    tableName: 'categories'
});
class Cart extends sequelize_1.Model {
}
exports.Cart = Cart;
Cart.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    modelName: 'Cart',
    tableName: 'carts'
});
class CartItem extends sequelize_1.Model {
}
exports.CartItem = CartItem;
CartItem.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    cartId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'carts',
            key: 'id'
        }
    },
    productId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items'
});
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
        defaultValue: 'pending'
    },
    total: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    tax: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    shipping: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    discount: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    shippingAddress: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false
    },
    billingAddress: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    trackingNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    modelName: 'Order',
    tableName: 'orders'
});
class OrderItem extends sequelize_1.Model {
}
exports.OrderItem = OrderItem;
OrderItem.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    productId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    productSnapshot: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items'
});
class Address extends sequelize_1.Model {
}
exports.Address = Address;
Address.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    label: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    company: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    street: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    zipCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'US'
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isDefault: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    modelName: 'Address',
    tableName: 'addresses'
});
class PaymentMethod extends sequelize_1.Model {
}
exports.PaymentMethod = PaymentMethod;
PaymentMethod.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'),
        allowNull: false
    },
    provider: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    lastFour: {
        type: sequelize_1.DataTypes.STRING(4),
        allowNull: false
    },
    expiryMonth: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 12
        }
    },
    expiryYear: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    cardholderName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isDefault: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    modelName: 'PaymentMethod',
    tableName: 'payment_methods'
});
class Review extends sequelize_1.Model {
}
exports.Review = Review;
Review.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    productId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    rating: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    comment: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    isVerifiedPurchase: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    isApproved: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.sequelize,
    modelName: 'Review',
    tableName: 'reviews'
});
const setupAssociations = () => {
    User.hasMany(Cart, { foreignKey: 'userId', as: 'carts' });
    User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
    User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
    User.hasMany(PaymentMethod, { foreignKey: 'userId', as: 'paymentMethods' });
    User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
    Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
    CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
    CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
    Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
    Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
    Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
    Product.belongsTo(Category, { foreignKey: 'category', targetKey: 'slug', as: 'categoryInfo' });
    Category.hasMany(Product, { foreignKey: 'category', sourceKey: 'slug', as: 'products' });
    Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
    Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
    Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
    OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
    OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
    Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    PaymentMethod.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
};
exports.setupAssociations = setupAssociations;
//# sourceMappingURL=index.js.map