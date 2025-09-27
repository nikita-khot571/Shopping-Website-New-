export class GraphQLClient {
    constructor(endpoint?: string);
    endpoint: string;
    headers: {
        'Content-Type': string;
    };
    setAuthToken(token: any): void;
    query(query: any, variables?: {}): Promise<any>;
    mutation(mutation: any, variables?: {}): Promise<any>;
}
export class GraphQLService {
    client: GraphQLClient;
    initializeAuth(): void;
    getProducts(category?: null, search?: null, limit?: number, offset?: number): Promise<any>;
    getProductById(id: any): Promise<any>;
    getCategories(): Promise<any>;
    registerUser(userData: any): Promise<any>;
    loginUser(email: any, password: any): Promise<any>;
    refreshToken(): Promise<any>;
    addToCart(userId: any, productId: any, quantity?: number): Promise<any>;
    updateCartItem(userId: any, productId: any, quantity: any): Promise<any>;
    removeFromCart(userId: any, productId: any): Promise<any>;
    getCart(userId: any): Promise<any>;
    clearCart(userId: any): Promise<any>;
    createOrder(orderData: any): Promise<any>;
    getUserOrders(userId: any, limit?: number, offset?: number): Promise<any>;
    updateOrderStatus(orderId: any, status: any): Promise<any>;
    getUserProfile(userId: any): Promise<any>;
    updateUserProfile(userId: any, profileData: any): Promise<any>;
    addAddress(userId: any, addressData: any): Promise<any>;
    updateAddress(addressId: any, addressData: any): Promise<any>;
    deleteAddress(addressId: any): Promise<any>;
    addPaymentMethod(userId: any, paymentData: any): Promise<any>;
    deletePaymentMethod(paymentMethodId: any): Promise<any>;
    addReview(productId: any, reviewData: any): Promise<any>;
    logout(): void;
    isAuthenticated(): boolean;
    getCurrentUser(): any;
}
export namespace GraphQLQueries {
    let GET_PRODUCTS: string;
    let GET_PRODUCT_BY_ID: string;
    let GET_CATEGORIES: string;
    let GET_USER_PROFILE: string;
    let GET_USER_ORDERS: string;
    let GET_CART: string;
}
export namespace GraphQLMutations {
    let REGISTER_USER: string;
    let LOGIN_USER: string;
    let REFRESH_TOKEN: string;
    let CREATE_PRODUCT: string;
    let UPDATE_PRODUCT: string;
    let DELETE_PRODUCT: string;
    let ADD_TO_CART: string;
    let UPDATE_CART_ITEM: string;
    let REMOVE_FROM_CART: string;
    let CLEAR_CART: string;
    let CREATE_ORDER: string;
    let UPDATE_ORDER_STATUS: string;
    let UPDATE_USER_PROFILE: string;
    let ADD_ADDRESS: string;
    let UPDATE_ADDRESS: string;
    let DELETE_ADDRESS: string;
    let ADD_PAYMENT_METHOD: string;
    let DELETE_PAYMENT_METHOD: string;
    let ADD_REVIEW: string;
}
export namespace GraphQLTypes {
    let RegisterInput: string;
    let ProductInput: string;
    let OrderInput: string;
    let OrderItemInput: string;
    let AddressInput: string;
    let PaymentMethodInput: string;
    let ReviewInput: string;
    let UserProfileInput: string;
    let OrderStatus: string;
    let PaymentType: string;
}
export class GraphQLError extends Error {
    constructor(message: any, code: any, path: any);
    code: any;
    path: any;
}
//# sourceMappingURL=graphql.d.ts.map