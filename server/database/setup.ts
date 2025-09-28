import { Sequelize, DataTypes, Model } from 'sequelize';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'shopzone',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    logging: false
});

export class User extends Model {
    public id!: string;
    public email!: string;
    public password!: string;
    public firstName!: string;
    public lastName!: string;
    public role!: string;
}

User.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'customer'), defaultValue: 'customer' }
}, { sequelize, modelName: 'User' });

export class Product extends Model {
    public id!: string;
    public name!: string;
    public description!: string;
    public price!: number;
    public category!: string;
    public stock!: number;
}

Product.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { sequelize, modelName: 'Product' });

export async function setupDatabase() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: false });
        
        const userCount = await User.count();
        if (userCount === 0) {
            await User.create({
                email: 'admin@shopzone.com',
                password: await bcrypt.hash('admin123', 12),
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin'
            });
            
            const products = [
                { name: 'iPhone 14 Pro', description: 'Latest Apple smartphone', price: 999.99, category: 'electronics', stock: 50 },
                { name: 'MacBook Air M2', description: 'Apple laptop with M2 chip', price: 1199.99, category: 'electronics', stock: 30 },
                { name: 'The Great Gatsby', description: 'Classic American novel', price: 12.99, category: 'books', stock: 100 },
                { name: 'Nike Air Max', description: 'Comfortable running shoes', price: 129.99, category: 'clothing', stock: 75 },
                { name: 'Coffee Maker', description: 'Programmable coffee maker', price: 79.99, category: 'home', stock: 40 }
            ];
            
            for (const product of products) {
                await Product.create(product);
            }
        }
        
        console.log('✅ Database setup complete');
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}