import { Model, Optional } from 'sequelize';
interface UserAttributes {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    role: 'admin' | 'customer';
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    role: 'admin' | 'customer';
    emailVerified: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    toJSON(): Omit<UserAttributes, 'password'>;
}
interface ProductAttributes {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    images?: string[];
    stock: number;
    sku: string;
    isActive: boolean;
    weight?: number;
    dimensions?: object;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    images?: string[];
    stock: number;
    sku: string;
    isActive: boolean;
    weight?: number;
    dimensions?: object;
    tags?: string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
interface CategoryAttributes {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive: boolean;
    sortOrder: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
interface CartAttributes {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
interface CartCreationAttributes extends Optional<CartAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
    id: string;
    userId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
interface CartItemAttributes {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}
interface CartItemCreationAttributes extends Optional<CartItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class CartItem extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    price: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
interface OrderAttributes {
    id: string;
    userId: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    total: number;
    subtotal: number;
    tax: number;
    shipping: number;
    discount?: number;
    currency: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod?: string;
    shippingAddress: object;
    billingAddress?: object;
    notes?: string;
    trackingNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    id: string;
    userId: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    total: number;
    subtotal: number;
    tax: number;
    shipping: number;
    discount?: number;
    currency: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod?: string;
    shippingAddress: object;
    billingAddress?: object;
    notes?: string;
    trackingNumber?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
interface OrderItemAttributes {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    productSnapshot: object;
    createdAt: Date;
    updatedAt: Date;
}
interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    productSnapshot: object;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
interface AddressAttributes {
    id: string;
    userId: string;
    label: string;
    firstName: string;
    lastName: string;
    company?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface AddressCreationAttributes extends Optional<AddressAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class Address extends Model<AddressAttributes, AddressCreationAttributes> implements AddressAttributes {
    id: string;
    userId: string;
    label: string;
    firstName: string;
    lastName: string;
    company?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
interface PaymentMethodAttributes {
    id: string;
    userId: string;
    type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
    provider: string;
    lastFour: string;
    expiryMonth?: number;
    expiryYear?: number;
    cardholderName?: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface PaymentMethodCreationAttributes extends Optional<PaymentMethodAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class PaymentMethod extends Model<PaymentMethodAttributes, PaymentMethodCreationAttributes> implements PaymentMethodAttributes {
    id: string;
    userId: string;
    type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
    provider: string;
    lastFour: string;
    expiryMonth?: number;
    expiryYear?: number;
    cardholderName?: string;
    isDefault: boolean;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
interface ReviewAttributes {
    id: string;
    userId: string;
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
    isVerifiedPurchase: boolean;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
export declare class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    id: string;
    userId: string;
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
    isVerifiedPurchase: boolean;
    isApproved: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export declare const setupAssociations: () => void;
export { User, Product, Category, Cart, CartItem, Order, OrderItem, Address, PaymentMethod, Review };
//# sourceMappingURL=index.d.ts.map