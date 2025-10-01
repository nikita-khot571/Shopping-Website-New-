import { getDatabase, saveToDatabase, Database, User, Product, CartItem, Order, OrderItem } from './setup';

// Helper functions for JSON database operations

export class UserModel {
  static findByPk(id: string): User | null {
    const db = getDatabase();
    return db.users.find(user => user.id === id) || null;
  }

  static findOne(options: { where: { email?: string } }): User | null {
    const db = getDatabase();
    const { where } = options;
    return db.users.find(user =>
      (where.email && user.email === where.email)
    ) || null;
  }

  static findAll(options?: { order?: any[] }): User[] {
    const db = getDatabase();
    let users = [...db.users];

    if (options?.order) {
      // Simple sorting by createdAt DESC
      users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return users;
  }

  static async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const db = getDatabase();
    const newUser: User = {
      id: require('uuid').v4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveToDatabase(db);
    return newUser;
  }
}

export class ProductModel {
  static findByPk(id: string): Product | null {
    const db = getDatabase();
    return db.products.find(product => product.id === id) || null;
  }

  static findAll(options?: {
    where?: any;
    limit?: number;
    offset?: number;
    order?: any[];
    include?: any[];
  }): (Product & { Product?: Product })[] {
    const db = getDatabase();
    let products = [...db.products];

    if (options?.where) {
      const { where } = options;
      if (where.category && where.category !== 'all') {
        products = products.filter(p => p.category === where.category);
      }
      if (where.name) {
        products = products.filter(p =>
          p.name.toLowerCase().includes(where.name.toLowerCase())
        );
      }
      if (where.description) {
        products = products.filter(p =>
          p.description.toLowerCase().includes(where.description.toLowerCase())
        );
      }
    }

    // Sorting
    if (options?.order) {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Pagination
    if (options?.offset) {
      products = products.slice(options.offset);
    }
    if (options?.limit) {
      products = products.slice(0, options.limit);
    }

    // Include associations
    if (options?.include) {
      return products.map(p => ({ ...p, Product: p }));
    }

    return products;
  }

  static async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const db = getDatabase();
    const newProduct: Product = {
      id: require('uuid').v4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.products.push(newProduct);
    saveToDatabase(db);
    return newProduct;
  }

  static async save(product: Product): Promise<void> {
    const db = getDatabase();
    const index = db.products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      db.products[index] = { ...product, updatedAt: new Date().toISOString() };
      saveToDatabase(db);
    }
  }

  static async destroy(options: { where: { id?: string } }): Promise<void> {
    const db = getDatabase();
    if (options.where.id) {
      db.products = db.products.filter(p => p.id !== options.where.id);
      saveToDatabase(db);
    }
  }
}

export class CartModel {
  static findAll(options: {
    where?: { userId?: string };
    include?: any[];
    order?: any[];
  }): (CartItem & { product?: Product; Product?: Product })[] {
    const db = getDatabase();
    let cartItems = [...db.cart_items];

    if (options.where?.userId) {
      cartItems = cartItems.filter(item => item.userId === options.where!.userId);
    }

    // Include product associations
    if (options.include) {
      cartItems = cartItems.map(item => {
        const product = db.products.find(p => p.id === item.productId);
        return { ...item, product, Product: product };
      });
    }

    // Sorting
    if (options.order) {
      cartItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return cartItems;
  }

  static findOne(options: { where: { userId: string; productId: string } }): CartItem | null {
    const db = getDatabase();
    return db.cart_items.find(item =>
      item.userId === options.where.userId && item.productId === options.where.productId
    ) || null;
  }

  static async create(data: Omit<CartItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CartItem> {
    const db = getDatabase();
    const newItem: CartItem = {
      id: require('uuid').v4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.cart_items.push(newItem);
    saveToDatabase(db);
    return newItem;
  }

  static async save(item: CartItem): Promise<void> {
    const db = getDatabase();
    const index = db.cart_items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      db.cart_items[index] = { ...item, updatedAt: new Date().toISOString() };
      saveToDatabase(db);
    }
  }

  static async destroy(options: { where: { userId?: string; productId?: string } }): Promise<void> {
    const db = getDatabase();
    if (options.where.userId && options.where.productId) {
      db.cart_items = db.cart_items.filter(item =>
        !(item.userId === options.where!.userId && item.productId === options.where!.productId)
      );
    } else if (options.where.userId) {
      db.cart_items = db.cart_items.filter(item => item.userId !== options.where!.userId);
    }
    saveToDatabase(db);
  }
}

export class OrderModel {
  static findAll(options: {
    where?: { userId?: string };
    include?: any[];
    order?: any[];
  }): (Order & { user?: User; User?: User; items?: OrderItem[]; order_items?: OrderItem[] })[] {
    const db = getDatabase();
    let orders = [...db.orders];

    if (options.where?.userId) {
      orders = orders.filter(order => order.userId === options.where!.userId);
    }

    // Include associations
    if (options.include) {
      orders = orders.map(order => {
        const user = db.users.find(u => u.id === order.userId);
        const items = db.order_items.filter(item => item.orderId === order.id);
        return { ...order, user, User: user, items, order_items: items };
      });
    }

    // Sorting
    if (options.order) {
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return orders;
  }

  static findByPk(id: string, options?: { include?: any[] }): (Order & { user?: User; User?: User; items?: OrderItem[]; order_items?: OrderItem[] }) | null {
    const db = getDatabase();
    const order = db.orders.find(o => o.id === id);
    if (!order) return null;

    if (options?.include) {
      const user = db.users.find(u => u.id === order.userId);
      const items = db.order_items.filter(item => item.orderId === order.id);
      return { ...order, user, User: user, items, order_items: items };
    }

    return order;
  }

  static async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const db = getDatabase();
    const newOrder: Order = {
      id: require('uuid').v4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.orders.push(newOrder);
    saveToDatabase(db);
    return newOrder;
  }

  static async save(order: Order): Promise<void> {
    const db = getDatabase();
    const index = db.orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      db.orders[index] = { ...order, updatedAt: new Date().toISOString() };
      saveToDatabase(db);
    }
  }
}

export class OrderItemModel {
  static findAll(options: {
    where?: { orderId?: string };
    include?: any[];
  }): (OrderItem & { product?: Product; Product?: Product })[] {
    const db = getDatabase();
    let items = [...db.order_items];

    if (options.where?.orderId) {
      items = items.filter(item => item.orderId === options.where!.orderId);
    }

    // Include product associations
    if (options.include) {
      items = items.map(item => {
        const product = db.products.find(p => p.id === item.productId);
        return { ...item, product, Product: product };
      });
    }

    return items;
  }

  static async create(data: Omit<OrderItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderItem> {
    const db = getDatabase();
    const newItem: OrderItem = {
      id: require('uuid').v4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.order_items.push(newItem);
    saveToDatabase(db);
    return newItem;
  }
}

// Export the models
export { UserModel as User, ProductModel as Product, CartModel as Cart, OrderModel as Order, OrderItemModel as OrderItem };
