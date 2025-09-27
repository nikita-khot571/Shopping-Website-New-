"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = exports.testConnection = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    database: process.env.DB_NAME || 'shopzone',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
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
exports.sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions,
    define: dbConfig.define,
    timezone: dbConfig.timezone
});
const testConnection = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');
        return true;
    }
    catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        return false;
    }
};
exports.testConnection = testConnection;
const closeConnection = async () => {
    try {
        await exports.sequelize.close();
        console.log('✅ Database connection closed successfully.');
    }
    catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
};
exports.closeConnection = closeConnection;
exports.default = exports.sequelize;
//# sourceMappingURL=connection.js.map