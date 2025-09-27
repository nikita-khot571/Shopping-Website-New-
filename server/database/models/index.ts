import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../connection';
import bcrypt from 'bcryptjs';

// User Model
interface UserAttributes {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    role: 'admin' | 'customer';
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public email!: string;
    public password!: string;
    public firstName!: string;
    public lastName!: string;
    public phone?: string;
    public isActive!: boolean;
    public role!: 'admin' | 'customer';
    public emailVerified!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Instance methods
    public async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }

    public toJSON(): Omit<UserAttributes, 'password'> {
        const values = { ...this.get() };
        delete values.password;
        return values;
    }
}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 255]
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    role: {
        type: DataTypes.ENUM('admin', 'customer'),
        defaultValue: 'customer'
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
        beforeCreate: async (user: User) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        },
        beforeUpdate: async (user: User) => {
            if (user.changed('password') && user.password) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        }
    }
});

// Product Model
interface ProductAttributes {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    images?: string[];
    stock: number;
    sku: string;
    isActive: boolean;
    weight?: number;
    dimensions?: object;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    public id!: string;
    public name!: string;
    public description?: string;
    public price!: number;
    public category!: string;
    public image?: string;
    public images?: string[];
    public stock!: number;
    public sku!: string;
    public isActive!: boolean;
    public weight?: number;
    public dimensions?: object;
    public tags?: string[];
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Product.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 255]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    dimensions: {
        type: DataTypes.JSON,
        allowNull: true
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Product',
    tableName: 'products'
});

// Category Model
interface CategoryAttributes {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    public id!: string;
    public name!: string;
    public slug!: string;
    public description?: string;
    public image?: string;
    public parentId?: string;
    public isActive!: boolean;
    public sortOrder!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Category.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories'
});

// Cart Model
interface CartAttributes {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
    public id!: string;
    public userId!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Cart.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts'
});

// CartItem Model
interface CartItemAttributes {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
    public id!: string;
    public cartId!: string;
    public productId!: string;
    public quantity!: number;
    public price!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CartItem.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cartId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'carts',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items'
});

// Order Model
interface OrderAttributes {
    id: string;
    userId: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    total: number;
    subtotal: number;
    tax: number;
    shipping: number;
    discount?: number;
    currency: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod?: string;
    shippingAddress: object;
    billingAddress?: object;
    notes?: string;
    trackingNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    public id!: string;
    public userId!: string;
    public status!: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    public total!: number;
    public subtotal!: number;
    public tax!: number;
    public shipping!: number;
    public discount?: number;
    public currency!: string;
    public paymentStatus!: 'pending' | 'completed' | 'failed' | 'refunded';
    public paymentMethod?: string;
    public shippingAddress!: object;
    public billingAddress?: object;
    public notes?: string;
    public trackingNumber?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Order.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
        defaultValue: 'pending'
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    shipping: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD'
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shippingAddress: {
        type: DataTypes.JSON,
        allowNull: false
    },
    billingAddress: {
        type: DataTypes.JSON,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders'
});

// OrderItem Model
interface OrderItemAttributes {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    productSnapshot: object;
    createdAt: Date;
    updatedAt: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
    public id!: string;
    public orderId!: string;
    public productId!: string;
    public quantity!: number;
    public price!: number;
    public productSnapshot!: object;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

OrderItem.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    productSnapshot: {
        type: DataTypes.JSON,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items'
});

// Address Model
interface AddressAttributes {
    id: string;
    userId: string;
    label: string;
    firstName: string;
    lastName: string;
    company?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface AddressCreationAttributes extends Optional<AddressAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
    public id!: string;
    public userId!: string;
    public label!: string;
    public firstName!: string;
    public lastName!: string;
    public company?: string;
    public street!: string;
    public city!: string;
    public state!: string;
    public zipCode!: string;
    public country!: string;
    public phone?: string;
    public isDefault!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Address.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company: {
        type: DataTypes.STRING,
        allowNull: true
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    zipCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'US'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Address',
    tableName: 'addresses'
});

// PaymentMethod Model
interface PaymentMethodAttributes {
    id: string;
    userId: string;
    type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
    provider: string;
    lastFour: string;
    expiryMonth?: number;
    expiryYear?: number;
    cardholderName?: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface PaymentMethodCreationAttributes extends Optional<PaymentMethodAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PaymentMethod extends Model<PaymentMethodAttributes, PaymentMethodCreationAttributes> implements PaymentMethodAttributes {
    public id!: string;
    public userId!: string;
    public type!: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
    public provider!: string;
    public lastFour!: string;
    public expiryMonth?: number;
    public expiryYear?: number;
    public cardholderName?: string;
    public isDefault!: boolean;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PaymentMethod.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'),
        allowNull: false
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastFour: {
        type: DataTypes.STRING(4),
        allowNull: false
    },
    expiryMonth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 12
        }
    },
    expiryYear: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cardholderName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'PaymentMethod',
    tableName: 'payment_methods'
});

// Review Model
interface ReviewAttributes {
    id: string;
    userId: string;
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
    isVerifiedPurchase: boolean;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    public id!: string;
    public userId!: string;
    public productId!: string;
    public rating!: number;
    public title?: string;
    public comment?: string;
    public isVerifiedPurchase!: boolean;
    public isApproved!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Review.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isVerifiedPurchase: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews'
});

// Define associations
export const setupAssociations = () => {
    // User associations
    User.hasMany(Cart, { foreignKey: 'userId', as: 'carts' });
    User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
    User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
    User.hasMany(PaymentMethod, { foreignKey: 'userId', as: 'paymentMethods' });
    User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });

    // Cart associations
    Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });

    // CartItem associations
    CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
    CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

    // Product associations
    Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
    Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
    Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
    Product.belongsTo(Category, { foreignKey: 'category', targetKey: 'slug', as: 'categoryInfo' });

    // Category associations
    Category.hasMany(Product, { foreignKey: 'category', sourceKey: 'slug', as: 'products' });
    Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
    Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

    // Order associations
    Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });

    // OrderItem associations
    OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
    OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

    // Address associations
    Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // PaymentMethod associations
    PaymentMethod.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Review associations
    Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
};

// Export all models
export {
    User,
    Product,
    Category,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Address,
    PaymentMethod,
    Review
};