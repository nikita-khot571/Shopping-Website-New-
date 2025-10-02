import { User, Product, CartItem, Order, OrderItem } from './models';
import { Op } from 'sequelize';

// Sequelize-based database operations

export class UserModel {
  static async findByPk(id: string) {
    return await User.findByPk(id);
  }

  static async findOne(options: { where: { email?: string } }) {
    return await User.findOne(options);
  }

  static async findAll(options?: { order?: any[] }) {
    return await User.findAll(options);
  }

  static async create(data: any) {
    return await User.create(data);
  }

  static async save(user: any) {
    return await user.save();
  }
}

export class ProductModel {
  static async findByPk(id: string) {
    return await Product.findByPk(id);
  }

  static async findAll(options?: {
    where?: any;
    limit?: number;
    offset?: number;
    order?: any[];
    include?: any[];
  }) {
    // Handle search functionality
    if (options?.where?.name) {
      options.where = {
        ...options.where,
        name: { [Op.iLike]: `%${options.where.name}%` }
      };
    }
    if (options?.where?.description) {
      options.where = {
        ...options.where,
        description: { [Op.iLike]: `%${options.where.description}%` }
      };
    }

    return await Product.findAll(options);
  }

  static async create(data: any) {
    return await Product.create(data);
  }

  static async save(product: any) {
    return await product.save();
  }

  static async destroy(options: { where: { id?: string } }) {
    return await Product.destroy(options);
  }
}

export class CartModel {
  static async findAll(options: {
    where?: { userId?: string };
    include?: any[];
    order?: any[];
  }) {
    return await CartItem.findAll(options);
  }

  static async findOne(options: { where: { userId: string; productId: string } }) {
    return await CartItem.findOne(options);
  }

  static async create(data: any) {
    return await CartItem.create(data);
  }

  static async save(item: any) {
    return await item.save();
  }

  static async destroy(options: { where: { userId?: string; productId?: string } }) {
    return await CartItem.destroy(options);
  }
}

export class OrderModel {
  static async findAll(options: {
    where?: { userId?: string };
    include?: any[];
    order?: any[];
  }) {
    return await Order.findAll(options);
  }

  static async findByPk(id: string, options?: { include?: any[] }) {
    return await Order.findByPk(id, options);
  }

  static async create(data: any) {
    return await Order.create(data);
  }

  static async save(order: any) {
    return await order.save();
  }
}

export class OrderItemModel {
  static async findAll(options: {
    where?: { orderId?: string };
    include?: any[];
  }) {
    return await OrderItem.findAll(options);
  }

  static async create(data: any) {
    return await OrderItem.create(data);
  }
}

// Export the models
export { UserModel as User, ProductModel as Product, CartModel as Cart, OrderModel as Order, OrderItemModel as OrderItem };
