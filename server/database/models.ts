import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import sequelize from "./sequelize";

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "phone" | "createdAt" | "updatedAt"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public phone?: string;
  public role!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: false,
    }
  );
}

interface ProductAttributes {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "id" | "description" | "image" | "createdAt" | "updatedAt"> {}

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public price!: number;
  public category!: string;
  public image?: string;
  public stock!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export function initProductModel(sequelize: Sequelize) {
  Product.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "products",
      timestamps: false,
    }
  );
}

interface CartItemAttributes {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CartItemCreationAttributes extends Optional<CartItemAttributes, "id" | "createdAt" | "updatedAt"> {}

export class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  public id!: string;
  public userId!: string;
  public productId!: string;
  public quantity!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export function initCartItemModel(sequelize: Sequelize) {
  CartItem.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      productId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "cart_items",
      timestamps: false,
    }
  );
}

interface OrderAttributes {
  id: string;
  userId: string;
  total: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public userId!: string;
  public total!: number;
  public status!: string;
  public shippingAddress!: string;
  public paymentMethod!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export function initOrderModel(sequelize: Sequelize) {
  Order.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "orders",
      timestamps: false,
    }
  );
}

interface OrderItemAttributes {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, "id" | "createdAt" | "updatedAt"> {}

export class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: string;
  public orderId!: string;
  public productId!: string;
  public quantity!: number;
  public price!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export function initOrderItemModel(sequelize: Sequelize) {
  OrderItem.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      productId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "order_items",
      timestamps: false,
    }
  );
}

// Address Model
interface AddressAttributes {
  id: string;
  userId: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AddressCreationAttributes
  extends Optional<AddressAttributes, "id" | "isDefault" | "createdAt" | "updatedAt"> {}

export class Address
  extends Model<AddressAttributes, AddressCreationAttributes>
  implements AddressAttributes
{
  public id!: string;
  public userId!: string;
  public label!: string;
  public firstName!: string;
  public lastName!: string;
  public street!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public country!: string;
  public isDefault!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export function initAddressModel(sequelize: Sequelize) {
  Address.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(36),
        allowNull: false,
      },
      label: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      zipCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "addresses",
      timestamps: false,
    }
  );
}