import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
    database: process.env.DB_NAME || 'shopzone',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql' as const,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        supportBigNumbers: true,
        bigNumberStrings: true
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    },
    timezone: '+00:00'
};

// Create Sequelize instance
export const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        pool: dbConfig.pool,
        logging: dbConfig.logging,
        dialectOptions: dbConfig.dialectOptions,
        define: dbConfig.define,
        timezone: dbConfig.timezone
    }
);

// Test connection function
export const testConnection = async (): Promise<boolean> => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        return false;
    }
};

// Close connection function
export const closeConnection = async (): Promise<void> => {
    try {
        await sequelize.close();
        console.log('✅ Database connection closed successfully.');
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
};

export default sequelize;