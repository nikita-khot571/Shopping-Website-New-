import sequelize from "./sequelize";
import { initUserModel, User } from "./models";
import { initProductModel, Product } from "./models";
import { initCartItemModel, CartItem } from "./models";
import { initOrderModel, Order } from "./models";
import { initOrderItemModel, OrderItem } from "./models";
import { initAddressModel, Address } from "./models";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

initUserModel(sequelize);
initProductModel(sequelize);
initCartItemModel(sequelize);
initOrderModel(sequelize);
initOrderItemModel(sequelize);
initAddressModel(sequelize);

// Define associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });


export async function setupDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection to MySQL has been established successfully.");
// --------------------------------------------------------------------------------------------------------------------------------------------------
    // Check if tables exist and have data
    const userCount = await User.count();
    const productCount = await Product.count();

    if (userCount === 0 && productCount === 0) {
      console.log("Database is empty, inserting demo data...");

      await sequelize.sync({ force: true }); // Only force sync if database is empty

      // Insert demo users with hashed passwords
      const hashedAdminPassword = await bcrypt.hash("admin123", 12);
      const hashedCustomerPassword = await bcrypt.hash("customer123", 12);

      await User.create({
        id: uuidv4(),
        email: "admin@shopzone.com",
        password: hashedAdminPassword,
        firstName: "Admin",
        lastName: "User",
        phone: null,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await User.create({
        id: uuidv4(),
        email: "customer@shopzone.com",
        password: hashedCustomerPassword,
        firstName: "Customer",
        lastName: "User",
        phone: null,
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Insert sample products
      const products = [
        {
          id: uuidv4(),
          name: "Wireless Bluetooth Headphones",
          description: "High-quality wireless headphones with noise cancellation",
          price: 99.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
          stock: 50,
        },
        {
          id: uuidv4(),
          name: "Smart Watch",
          description: "Fitness tracking smartwatch with heart rate monitor",
          price: 199.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
          stock: 30,
        },
        {
          id: uuidv4(),
          name: "Running Shoes",
          description: "Comfortable running shoes for all terrains",
          price: 79.99,
          category: "Sports",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
          stock: 100,
        },
        {
          id: uuidv4(),
          name: "Coffee Maker",
          description: "Programmable coffee maker with thermal carafe",
          price: 49.99,
          category: "Home",
          image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
          stock: 25,
        },
        {
          id: uuidv4(),
          name: "Yoga Mat",
          description: "Non-slip yoga mat for home workouts",
          price: 29.99,
          category: "Sports",
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
          stock: 75,
        },
        {
          id: uuidv4(),
          name: "Laptop Stand",
          description: "Adjustable laptop stand for better ergonomics",
          price: 39.99,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
          stock: 40,
        },
      ];

      for (const product of products) {
        await Product.create({
          ...product, // (...): Merge existing options
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      console.log("Demo data insertion completed.");
    } else {
      // console.log(`Database already has ${userCount} users and ${productCount} products. Skipping demo data insertion.`);
      await sequelize.sync();
    }

   // console.log("Database setup completed.");
  } catch (error) {
    console.error("Unable to connect to the database or setup data:", error);
  }
}


