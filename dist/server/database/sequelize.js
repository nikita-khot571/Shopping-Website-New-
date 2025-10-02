"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize(process.env.MYSQL_DATABASE || "shopzone", process.env.MYSQL_USER || "root", process.env.MYSQL_PASSWORD || "", {
    host: process.env.MYSQL_HOST || "localhost",
    dialect: "mysql",
    logging: false,
});
exports.default = sequelize;
