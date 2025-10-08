"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("./database/sequelize"));
const models_1 = require("./database/models");
const operations_1 = require("./database/operations");
(0, models_1.initUserModel)(sequelize_1.default);
async function testDbConnection() {
    try {
        await sequelize_1.default.authenticate();
        console.log('Sequelize connection authenticated.');
        const user = await operations_1.User.findOne({ where: { email: 'admin@shopzone.com' } });
        if (user) {
            console.log('Database connection successful. User found:', user.email);
        }
        else {
            console.log('Database connection successful but user not found.');
        }
    }
    catch (error) {
        console.error('Database connection failed:', error);
    }
    process.exit(0);
}
testDbConnection();
