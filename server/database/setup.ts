import { Sequelize, DataTypes, Model } from 'sequelize';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Create database directory if it doesn't exist
const dbPath = process.env.DB_PATH || './database/shopzone.db';
const dbDir = path.dirname(dbPath);

console.log('📁 Database directory:', dbDir);
console.log('📁 Database file:', dbPath);

if (!fs.existsSync(dbDir)) {
    console.log('📁 Creating database directory...');
    fs.mkdirSync(dbDir, { recursive: true });
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
    define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
    }
});

export class User extends Model {
    public id!: string;
    public email!: string;
    public password!: string;
    public firstName!: string;
    public lastName!: string;
    public phone?: string;
    public role!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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
        validate: { isEmail: true }
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: { len: [6, 100] }
    },
    firstName: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: { len: [1, 50] }
    },
    lastName: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: { len: [1, 50] }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: { 
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'customer',
        validate: {
            isIn: [['admin', 'customer']]
        }
    }
}, { 
    sequelize, 
    modelName: 'User',
    tableName: 'users',
    timestamps: true
});

export class Product extends Model {
    public id!: string;
    public name!: string;
    public description!: string;
    public price!: number;
    public category!: string;
    public image?: string;
    public stock!: number;
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
        validate: { len: [1, 100] }
    },
    description: { 
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
        validate: { min: 0 }
    },
    category: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: { 
            isIn: [['electronics', 'books', 'clothing', 'home', 'sports', 'toys']]
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stock: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0,
        validate: { min: 0 }
    }
}, { 
    sequelize, 
    modelName: 'Product',
    tableName: 'products',
    timestamps: true
});

export class Cart extends Model {
    public id!: string;
    public userId!: string;
    public productId!: string;
    public quantity!: number;
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
        allowNull: false
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 }
    }
}, {
    sequelize,
    modelName: 'Cart',
    tableName: 'cart_items',
    timestamps: true
});

export class Order extends Model {
    public id!: string;
    public userId!: string;
    public total!: number;
    public status!: string;
    public shippingAddress!: string;
    public paymentMethod!: string;
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
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'processing', 'shipped', 'delivered', 'cancelled']]
        }
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true
});

export class OrderItem extends Model {
    public id!: string;
    public orderId!: string;
    public productId!: string;
    public quantity!: number;
    public price!: number;
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
        allowNull: false
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    }
}, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true
});

// Set up associations
User.hasMany(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Cart, { foreignKey: 'productId', onDelete: 'CASCADE' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

export async function setupDatabase() {
    try {
        console.log('🔄 Setting up SQLite database...');
        console.log('📁 Database file:', dbPath);
        
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established');
        
        // Sync database (create tables)
        await sequelize.sync({ force: false, alter: false });
        console.log('✅ Database tables synchronized');
        
        // Check if we need to seed data
        const userCount = await User.count();
        console.log(`👥 Found ${userCount} users in database`);
        
        if (userCount === 0) {
            console.log('🌱 Seeding initial data...');
            
            // Create admin user
            const adminUser = await User.create({
                email: 'admin@shopzone.com',
                password: await bcrypt.hash('admin123', 12),
                firstName: 'Admin',
                lastName: 'User',
                phone: '+1234567890',
                role: 'admin'
            });
            console.log('✅ Admin user created:', adminUser.email);
            
            // Create sample customer
            const customerUser = await User.create({
                email: 'customer@shopzone.com',
                password: await bcrypt.hash('customer123', 12),
                firstName: 'John',
                lastName: 'Doe',
                phone: '+1987654321',
                role: 'customer'
            });
            console.log('✅ Customer user created:', customerUser.email);
            
            // Create sample products
            const products = [
                { 
                    name: 'iPhone 14 Pro', 
                    description: 'Latest Apple smartphone with A16 Bionic chip and Dynamic Island', 
                    price: 999.99, 
                    category: 'electronics', 
                    stock: 50,
                    image: 'https://via.placeholder.com/300x200/007bff/ffffff?text=iPhone+14+Pro'
                },
                { 
                    name: 'MacBook Air M2', 
                    description: 'Apple laptop with M2 chip, 13-inch Liquid Retina display, and all-day battery', 
                    price: 1199.99, 
                    category: 'electronics', 
                    stock: 30,
                    image: 'https://via.placeholder.com/300x200/6c757d/ffffff?text=MacBook+Air+M2'
                },
                { 
                    name: 'The Great Gatsby', 
                    description: 'Classic American novel by F. Scott Fitzgerald - A timeless tale of love and tragedy', 
                    price: 12.99, 
                    category: 'books', 
                    stock: 100,
                    image: 'https://via.placeholder.com/300x200/28a745/ffffff?text=The+Great+Gatsby'
                },
                { 
                    name: 'Nike Air Max 270', 
                    description: 'Comfortable running shoes with Air Max cushioning and breathable mesh upper', 
                    price: 129.99, 
                    category: 'clothing', 
                    stock: 75,
                    image: 'https://via.placeholder.com/300x200/dc3545/ffffff?text=Nike+Air+Max'
                },
                { 
                    name: 'Breville Coffee Maker', 
                    description: 'Programmable drip coffee maker with thermal carafe and customizable settings', 
                    price: 79.99, 
                    category: 'home', 
                    stock: 40,
                    image: 'https://via.placeholder.com/300x200/ffc107/000000?text=Coffee+Maker'
                },
                {
                    name: 'Samsung Galaxy S23',
                    description: 'Latest Android smartphone with advanced camera system and 5G connectivity',
                    price: 799.99,
                    category: 'electronics',
                    stock: 40,
                    image: 'https://via.placeholder.com/300x200/17a2b8/ffffff?text=Galaxy+S23'
                },
                {
                    name: 'Dune by Frank Herbert',
                    description: 'Epic science fiction masterpiece - The best-selling science fiction novel of all time',
                    price: 15.99,
                    category: 'books',
                    stock: 60,
                    image: 'https://via.placeholder.com/300x200/6f42c1/ffffff?text=Dune'
                },
                {
                    name: 'Levi\'s 501 Jeans',
                    description: 'Classic straight-fit denim jeans - The original blue jean since 1873',
                    price: 59.99,
                    category: 'clothing',
                    stock: 90,
                    image: 'https://via.placeholder.com/300x200/fd7e14/ffffff?text=Levis+Jeans'
                },
                {
                    name: 'LED Desk Lamp',
                    description: 'Adjustable LED desk lamp with USB charging port and touch controls',
                    price: 39.99,
                    category: 'home',
                    stock: 45,
                    image: 'https://via.placeholder.com/300x200/20c997/ffffff?text=Desk+Lamp'
                },
                {
                    name: 'Sony WH-1000XM4',
                    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
                    price: 199.99,
                    category: 'electronics',
                    stock: 35,
                    image: 'https://via.placeholder.com/300x200/495057/ffffff?text=Sony+Headphones'
                }
            ];
            
            for (const product of products) {
                await Product.create(product);
            }
            
            console.log(`✅ Created ${products.length} sample products`);
            console.log('✅ Initial data seeding completed');
        }
        
        console.log('✅ Database setup complete');
        console.log(`📊 Database statistics:`);
        console.log(`   Users: ${await User.count()}`);
        console.log(`   Products: ${await Product.count()}`);
        console.log(`   Cart Items: ${await Cart.count()}`);
        console.log(`   Orders: ${await Order.count()}`);
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    }
}

// Export sequelize instance for use in other files
export { sequelize };

// If this file is run directly, setup the database
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('✅ Database setup completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Database setup failed:', error);
            process.exit(1);
        });
}