// GraphQL Client for ShopZone E-commerce
class GraphQLClient {
  constructor(endpoint = "http://localhost:4001/graphql") {
    this.endpoint = endpoint;
    this.headers = {
      "Content-Type": "application/json",
    };
  }

  setAuthToken(token) {
    this.headers["Authorization"] = `Bearer ${token}`;
  }

  async query(query, variables = {}) {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL Error: ${result.errors[0].message}`);
      }

      return result.data;
    } catch (error) {
      console.error("GraphQL Query Error:", error);
      throw error;
    }
  }

  async mutation(mutation, variables = {}) {
    return this.query(mutation, variables);
  }
}

// GraphQL Queries and Mutations
const GraphQLQueries = {
  // Product Queries
  GET_PRODUCTS: `
        query GetProducts($category: String, $search: String, $limit: Int, $offset: Int) {
            products(category: $category, search: $search, limit: $limit, offset: $offset) {
                id
                name
                description
                price
                category
                image
                stock
                createdAt
                updatedAt
            }
        }
    `,

  GET_PRODUCT_BY_ID: `
        query GetProductById($id: ID!) {
            product(id: $id) {
                id
                name
                description
                price
                category
                image
                images
                stock
                createdAt
                updatedAt
            }
        }
    `,

  GET_CATEGORIES: `
        query GetCategories {
            categories {
                id
                name
                slug
                description
                productsCount
            }
        }
    `,

  // User Queries
  GET_USER_PROFILE: `
        query GetUserProfile($id: ID!) {
            user(id: $id) {
                id
                email
                firstName
                lastName
                phone
                addresses {
                    id
                    label
                    street
                    city
                    state
                    zipCode
                    country
                    isDefault
                }
                paymentMethods {
                    id
                    type
                    lastFour
                    expiryMonth
                    expiryYear
                    isDefault
                }
                createdAt
                updatedAt
            }
        }
    `,

  GET_USER_ORDERS: `
        query GetUserOrders($userId: ID!, $limit: Int, $offset: Int) {
            orders(userId: $userId, limit: $limit, offset: $offset) {
                id
                status
                total
                items {
                    id
                    product {
                        id
                        name
                        image
                    }
                    quantity
                    price
                }
                shippingAddress {
                    street
                    city
                    state
                    zipCode
                    country
                }
                createdAt
                updatedAt
            }
        }
    `,

  // Cart Queries
  GET_CART: `
        query GetCart {
            cart {
                id
                userId
                productId
                quantity
                product {
                    id
                    name
                    description
                    price
                    image
                    stock
                }
                createdAt
                updatedAt
            }
        }
    `,
};

const GraphQLMutations = {
  // Authentication Mutations
  REGISTER_USER: `
        mutation RegisterUser($input: RegisterInput!) {
            registerUser(input: $input) {
                user {
                    id
                    email
                    firstName
                    lastName
                }
                token
                refreshToken
            }
        }
    `,

  LOGIN_USER: `
        mutation LoginUser($email: String!, $password: String!) {
            loginUser(email: $email, password: $password) {
                user {
                    id
                    email
                    firstName
                    lastName
                }
                token
                refreshToken
            }
        }
    `,

  REFRESH_TOKEN: `
        mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
                token
                refreshToken
            }
        }
    `,

  // Product Mutations
  CREATE_PRODUCT: `
        mutation CreateProduct($input: ProductInput!) {
            createProduct(input: $input) {
                id
                name
                description
                price
                category
                image
                stock
            }
        }
    `,

  UPDATE_PRODUCT: `
        mutation UpdateProduct($id: ID!, $input: ProductInput!) {
            updateProduct(id: $id, input: $input) {
                id
                name
                description
                price
                category
                image
                stock
            }
        }
    `,

  DELETE_PRODUCT: `
        mutation DeleteProduct($id: ID!) {
            deleteProduct(id: $id) {
                success
                message
            }
        }
    `,

  // Cart Mutations
  ADD_TO_CART: `
        mutation AddToCart($productId: ID!, $quantity: Int!) {
            addToCart(productId: $productId, quantity: $quantity) {
                id
                userId
                productId
                quantity
                product {
                    id
                    name
                    price
                }
                createdAt
                updatedAt
            }
        }
    `,

  UPDATE_CART_ITEM: `
        mutation UpdateCartItem($productId: ID!, $quantity: Int!) {
            updateCartQuantity(productId: $productId, quantity: $quantity) {
                id
                userId
                productId
                quantity
                product {
                    id
                    name
                    price
                }
                createdAt
                updatedAt
            }
        }
    `,

  REMOVE_FROM_CART: `
        mutation RemoveFromCart($productId: ID!) {
            removeFromCart(productId: $productId)
        }
    `,

  CLEAR_CART: `
        mutation ClearCart {
            clearCart
        }
    `,

  // Order Mutations
  CREATE_ORDER: `
    mutation CreateOrder($shippingAddress: String!, $paymentMethod: String!) {
        createOrder(shippingAddress: $shippingAddress, paymentMethod: $paymentMethod) {
            id
            status
            total
            items {
                id
                product {
                    id
                    name
                }
                quantity
                price
            }
            shippingAddress
            paymentMethod
            createdAt
        }
    }
`,

  UPDATE_ORDER_STATUS: `
        mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
            updateOrderStatus(id: $id, status: $status) {
                id
                status
                updatedAt
            }
        }
    `,

  // User Profile Mutations
  UPDATE_USER_PROFILE: `
    mutation UpdateUserProfile($firstName: String, $lastName: String, $phone: String) {
        updateProfile(firstName: $firstName, lastName: $lastName, phone: $phone) {
            id
            email
            firstName
            lastName
            phone
            updatedAt
        }
    }
`,

  ADD_ADDRESS: `
        mutation AddAddress($userId: ID!, $input: AddressInput!) {
            addAddress(userId: $userId, input: $input) {
                id
                label
                street
                city
                state
                zipCode
                country
                isDefault
            }
        }
    `,

  UPDATE_ADDRESS: `
        mutation UpdateAddress($id: ID!, $input: AddressInput!) {
            updateAddress(id: $id, input: $input) {
                id
                label
                street
                city
                state
                zipCode
                country
                isDefault
            }
        }
    `,

  DELETE_ADDRESS: `
        mutation DeleteAddress($id: ID!) {
            deleteAddress(id: $id) {
                success
                message
            }
        }
    `,

  ADD_PAYMENT_METHOD: `
        mutation AddPaymentMethod($userId: ID!, $input: PaymentMethodInput!) {
            addPaymentMethod(userId: $userId, input: $input) {
                id
                type
                lastFour
                expiryMonth
                expiryYear
                isDefault
            }
        }
    `,

  DELETE_PAYMENT_METHOD: `
        mutation DeletePaymentMethod($id: ID!) {
            deletePaymentMethod(id: $id) {
                success
                message
            }
        }
    `,  

  LOGOUT: `
        mutation Logout {
            logout
        }
    `,
};

// GraphQL Service Class
class GraphQLService {
  constructor() {
    this.client = new GraphQLClient();
    this.initializeAuth();
  }

  initializeAuth() {
    const token = localStorage.getItem("authToken");
    if (token) {
      this.client.setAuthToken(token);
    }
  }

  // Product Services
  async getProducts(category = null, search = null, limit = 50, offset = 0) {
    return this.client.query(GraphQLQueries.GET_PRODUCTS, {
      category,
      search,
      limit,
      offset,
    });
  }

  async getProductById(id) {
    return this.client.query(GraphQLQueries.GET_PRODUCT_BY_ID, { id });
  }

  async getCategories() {
    return this.client.query(GraphQLQueries.GET_CATEGORIES);
  }

  // Authentication Services
  async registerUser(userData) {
    const result = await this.client.mutation(GraphQLMutations.REGISTER_USER, {
      input: userData,
    });

    if (result.registerUser.token) {
      localStorage.setItem("authToken", result.registerUser.token);
      localStorage.setItem("refreshToken", result.registerUser.refreshToken);
      localStorage.setItem(
        "currentUser",
        JSON.stringify(result.registerUser.user)
      );
      this.client.setAuthToken(result.registerUser.token);
    }

    return result.registerUser;
  }

  async loginUser(email, password) {
    const result = await this.client.mutation(GraphQLMutations.LOGIN_USER, {
      email,
      password,
    });

    if (result.loginUser.token) {
      localStorage.setItem("authToken", result.loginUser.token);
      localStorage.setItem("refreshToken", result.loginUser.refreshToken);
      localStorage.setItem(
        "currentUser",
        JSON.stringify(result.loginUser.user)
      );
      this.client.setAuthToken(result.loginUser.token);
    }

    return result.loginUser;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const result = await this.client.mutation(GraphQLMutations.REFRESH_TOKEN, {
      refreshToken,
    });

    localStorage.setItem("authToken", result.refreshToken.token);
    localStorage.setItem("refreshToken", result.refreshToken.refreshToken);
    this.client.setAuthToken(result.refreshToken.token);

    return result.refreshToken;
  }

  // Cart Services
  async addToCart(productId, quantity = 1) {
    return this.client.mutation(GraphQLMutations.ADD_TO_CART, {
      productId,
      quantity: parseInt(quantity, 10),
    });
  }

  async updateCartItem(productId, quantity) {
    return this.client.mutation(GraphQLMutations.UPDATE_CART_ITEM, {
      productId,
      quantity: parseInt(quantity, 10),
    });
  }

  async removeFromCart(productId) {
    return this.client.mutation(GraphQLMutations.REMOVE_FROM_CART, {
      productId,
    });
  }

  async getCart() {
    const result = await this.client.query(GraphQLQueries.GET_CART);
    return result;
  }

  async clearCart() {
    return this.client.mutation(GraphQLMutations.CLEAR_CART);
  }

  // Order Services
  async createOrder(shippingAddress, paymentMethod) {
    const result = await this.client.mutation(GraphQLMutations.CREATE_ORDER, {
      shippingAddress,
      paymentMethod,
    });

    return result.createOrder;
  }

  async getUserOrders(userId, limit = 20, offset = 0) {
    return this.client.query(GraphQLQueries.GET_USER_ORDERS, {
      userId,
      limit,
      offset,
    });
  }

  async updateOrderStatus(orderId, status) {
    return this.client.mutation(GraphQLMutations.UPDATE_ORDER_STATUS, {
      id: orderId,
      status,
    });
  }

  // User Profile Services
  async getUserProfile(userId) {
    return this.client.query(GraphQLQueries.GET_USER_PROFILE, { id: userId });
  }

  async updateUserProfile(userId, profileData) {
    return this.client.mutation(GraphQLMutations.UPDATE_USER_PROFILE, {
      id: userId,
      input: profileData,
    });
  }

  async addAddress(userId, addressData) {
    return this.client.mutation(GraphQLMutations.ADD_ADDRESS, {
      userId,
      input: addressData,
    });
  }

  async updateAddress(addressId, addressData) {
    return this.client.mutation(GraphQLMutations.UPDATE_ADDRESS, {
      id: addressId,
      input: addressData,
    });
  }

  async deleteAddress(addressId) {
    return this.client.mutation(GraphQLMutations.DELETE_ADDRESS, {
      id: addressId,
    });
  }

  async addPaymentMethod(userId, paymentData) {
    return this.client.mutation(GraphQLMutations.ADD_PAYMENT_METHOD, {
      userId,
      input: paymentData,
    });
  }

  async deletePaymentMethod(paymentMethodId) {
    return this.client.mutation(GraphQLMutations.DELETE_PAYMENT_METHOD, {
      id: paymentMethodId,
    });
  }

 

  // Utility Methods
  async logout() {
    try {
      await this.client.mutation(GraphQLMutations.LOGOUT);
    } catch (error) {
      console.error("Server logout error:", error);
    }

    // Clear local auth state
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
    this.client.headers = {
      "Content-Type": "application/json",
    };
  }

  isAuthenticated() {
    return !!localStorage.getItem("authToken");
  }

  getCurrentUser() {
    const userData = localStorage.getItem("currentUser");
    return userData ? JSON.parse(userData) : null;
  }
}

class ApolloGraphQLService {
  constructor() {
    this.setupApolloClient();
  }

  setupApolloClient() {
   
    const httpLink = createHttpLink({
      uri: "/graphql",
      headers: {
        authorization: localStorage.getItem("authToken")
          ? `Bearer ${localStorage.getItem("authToken")}`
          : "",
      },
    });

    this.client = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          errorPolicy: "ignore",
        },
        query: {
          errorPolicy: "all",
        },
      },
    });
  }
}

class GraphQLError extends Error {
  constructor(message, code, path) {
    super(message);
    this.name = "GraphQLError";
    this.code = code;
    this.path = path;
  }
}

// GraphQL Type Definitions (for reference)
const GraphQLTypes = {
  RegisterInput: `
        input RegisterInput {
            email: String!
            password: String!
            firstName: String!
            lastName: String!
            phone: String
        }
    `,

  ProductInput: `
        input ProductInput {
            name: String!
            description: String
            price: Float!
            category: String!
            image: String
            stock: Int!
        }
    `,

  OrderItemInput: `
        input OrderItemInput {
            productId: ID!
            quantity: Int!
            price: Float!
        }
    `,

  AddressInput: `
        input AddressInput {
            label: String!
            street: String!
            city: String!
            state: String!
            zipCode: String!
            country: String!
            isDefault: Boolean
        }
    `,

  PaymentMethodInput: `
        input PaymentMethodInput {
            type: PaymentType!
            cardNumber: String!
            expiryMonth: Int!
            expiryYear: Int!
            cvv: String!
            cardholderName: String!
            isDefault: Boolean
        }
    `,

  ReviewInput: `
        input ReviewInput {
            rating: Int!
            comment: String
        }
    `,

  UserProfileInput: `
        input UserProfileInput {
            firstName: String
            lastName: String
            phone: String
        }
    `,

  // Enum Types
  OrderStatus: `
        enum OrderStatus {
            PENDING
            PROCESSING
            SHIPPED
            DELIVERED
            CANCELLED
            REFUNDED
        }
    `,

  PaymentType: `
        enum PaymentType {
            CREDIT_CARD
            DEBIT_CARD
            PAYPAL
            APPLE_PAY
            GOOGLE_PAY
        }
    `,
};

// Initialize GraphQL Service
let graphqlService;

document.addEventListener("DOMContentLoaded", function () {
  graphqlService = new GraphQLService();
  window.graphqlService = graphqlService; // Make it globally available
});

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GraphQLClient,
    GraphQLService,
    GraphQLQueries,
    GraphQLMutations,
    GraphQLTypes,
    GraphQLError,
  };
}
