# 🛒 ShopZone - Modern E-commerce Platform

A comprehensive, full-stack e-commerce application built with **GraphQL**, **Node.js**, **TypeScript**, and **MySQL**. Features complete user authentication, product catalog management, shopping cart functionality, order processing, and an admin panel with modern responsive design.

## 🚀 Key Features

### 🛍️ **Core E-commerce Functionality**
- **User Authentication & Authorization**: Secure JWT-based login/signup with role-based access (Admin/Customer)
- **Product Catalog**: Browse products across 6 categories (Electronics, Books, Clothing, Home, Sports, Toys)
- **Advanced Search & Filtering**: Real-time product search with category filtering
- **Shopping Cart Management**: Add/remove items, update quantities, persistent cart storage
- **Order Processing**: Complete checkout flow with shipping address and payment method selection
- **Order Management**: View order history, track order status, cancel orders
- **Address Management**: Save multiple shipping addresses with default selection

### 👨‍💼 **Admin Panel Features**
- **Product Management**: Create, update, delete products with image support
- **User Management**: View all registered users and their details
- **Order Management**: View all orders, update order status, track order fulfillment
- **Inventory Management**: Real-time stock tracking and updates

### 🎨 **User Experience**
- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Modern UI/UX**: Clean, intuitive interface with Font Awesome icons
- **Real Product Images**: High-quality product images from Amazon
- **Contact Form**: Email integration for customer support
- **Loading States**: Smooth user experience with loading indicators

## 🛠️ Technology Stack

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Apollo Server** - GraphQL server with introspection
- **TypeScript** - Type-safe JavaScript development
- **MySQL** - Relational database with Sequelize ORM
- **JWT** - Stateless authentication tokens
- **bcryptjs** - Secure password hashing
- **Nodemailer** - Email service integration
- **CORS** - Cross-origin resource sharing

### **Frontend**
- **HTML5/CSS3** - Modern markup and styling
- **JavaScript (ES6+)** - Client-side logic
- **Apollo Client** - GraphQL client for API communication
- **Bootstrap 5** - Responsive CSS framework
- **Font Awesome** - Icon library
- **Live Server** - Development server

### **Database**
- **MySQL** - Production-ready relational database
- **Sequelize** - TypeScript ORM with migrations
- **UUID** - Unique identifier generation

## 📁 Project Structure

```
Shopping-Website-New-/
├── server/                     # Backend TypeScript source
│   ├── index.ts               # Main server entry point
│   ├── schema.ts              # GraphQL schema & resolvers
│   └── database/
│       ├── models.ts          # Sequelize model definitions
│       ├── operations.ts      # Database operations
│       ├── sequelize.ts       # Database connection config
│       └── setup.ts          # Database initialization & seeding
├── dist/                      # Compiled JavaScript output
│   └── server/               # Compiled server files
├── public/                    # Frontend static files
│   ├── index.html            # Main product catalog page
│   ├── login.html            # User login page
│   ├── signup.html           # User registration page
│   ├── cart.html             # Shopping cart page
│   ├── checkout.html         # Checkout process page
│   ├── product.html          # Individual product page
│   ├── profile.html          # User profile management
│   ├── admin.html            # Admin panel dashboard
│   ├── app.js                # Main frontend JavaScript
│   ├── graphql.js            # GraphQL client setup
│   └── style.css             # Main stylesheet
├── mysql_schema.sql           # Database schema & sample data
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🚀 Getting Started

### **Prerequisites**
- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### **Installation & Setup**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Shopping-Website-New-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE shopzone;
   exit
   
   # Import schema and sample data
   mysql -u root -p shopzone < mysql_schema.sql
   ```

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=4001
   JWT_SECRET=your-super-secret-jwt-key-here
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=shopzone
   DB_USER=root
   DB_PASSWORD=your-mysql-password
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CONTACT_EMAIL=contact@shopzone.com
   ```

5. **Build and start the application**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Or build and start production
   npm run build
   npm start
   ```

### **Accessing the Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4001
- **GraphQL Playground**: http://localhost:4001/graphql
- **Health Check**: http://localhost:4001/health

### **Demo Accounts**

- **Admin**: `admin@shopzone.com` / `admin123`
- **Customer**: `customer@shopzone.com` / `customer123`

## 📡 API Documentation

### **GraphQL Schema Overview**

The API uses GraphQL with comprehensive type definitions and resolvers:

#### **Main Types**
```graphql
type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  phone: String
  role: String!
  addresses: [Address!]
  createdAt: String!
  updatedAt: String!
}

type Product {
  id: ID!
  name: String!
  description: String
  price: Float!
  category: String!
  image: String
  images: [String]
  stock: Int!
  createdAt: String!
  updatedAt: String!
}

type CartItem {
  id: ID!
  userId: ID!
  productId: ID!
  quantity: Int!
  product: Product
  createdAt: String!
  updatedAt: String!
}

type Order {
  id: ID!
  userId: ID!
  total: Float!
  status: String!
  shippingAddress: String!
  paymentMethod: String!
  items: [OrderItem!]!
  user: User!
  createdAt: String!
  updatedAt: String!
}

type Address {
  id: ID!
  userId: ID!
  label: String!
  firstName: String!
  lastName: String!
  street: String!
  city: String!
  state: String!
  zipCode: String!
  country: String!
  isDefault: Boolean!
  createdAt: String!
  updatedAt: String!
}
```

#### **Key Queries**
```graphql
# Product queries
products(category: String, search: String, limit: Int, offset: Int): [Product!]!
product(id: ID!): Product

# User queries
me: User
addresses: [Address!]!

# Cart queries
cart: [CartItem!]!

# Order queries
orders: [Order!]!

# Admin queries
users: [User!]!
allOrders: [Order!]!
adminProducts: [Product!]!
```

#### **Key Mutations**
```graphql
# Authentication
register(email: String!, password: String!, firstName: String!, lastName: String!, phone: String): AuthPayload!
login(email: String!, password: String!): AuthPayload!

# Cart management
addToCart(productId: ID!, quantity: Int!): CartItem!
updateCartQuantity(productId: ID!, quantity: Int!): CartItem!
removeFromCart(productId: ID!): Boolean!
clearCart: Boolean!

# Order management
createOrder(shippingAddress: String!, paymentMethod: String!): Order!
updateOrderStatus(id: ID!, status: String!): Order!

# Profile management
updateProfile(firstName: String, lastName: String, phone: String): User!

# Address management
addAddress(input: AddressInput!): Address!
updateAddress(id: ID!, input: AddressInput!): Address!
deleteAddress(id: ID!): Boolean!

# Admin operations
createProduct(name: String!, description: String, price: Float!, category: String!, image: String, images: [String], stock: Int!): Product!
updateProduct(id: ID!, name: String, description: String, price: Float, category: String, image: String, images: [String], stock: Int): Product!
deleteProduct(id: ID!): Boolean!
```

## 🗄️ Database Schema

### **Tables Overview**
- **users** - User accounts with authentication and profile data
- **products** - Product catalog with images and inventory
- **cart_items** - Shopping cart items per user
- **orders** - Order records with status tracking
- **order_items** - Individual items within orders
- **addresses** - User shipping addresses

### **Key Relationships**
- Users have many Orders, CartItems, and Addresses
- Products have many CartItems and OrderItems
- Orders have many OrderItems and belong to Users
- Orders reference OrderItems which reference Products

### **Sample Data**
- **Users**: 2 demo accounts (1 admin, 1 customer)
- **Products**: 30+ products across 6 categories
- **Categories**: Electronics, Books, Clothing, Home, Sports, Toys

## 🔧 Development

### **Available Scripts**

```bash
# Development (backend + frontend with hot reload)
npm run dev

# Backend only (with TypeScript compilation)
npm run server:dev

# Frontend only (live server)
npm run client:dev

# Build for production
npm run build

# Start production server
npm start

# Database setup (if needed)
npm run db:setup
```

### **Environment Variables**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 4001 | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `DB_HOST` | MySQL host | localhost | Yes |
| `DB_PORT` | MySQL port | 3306 | Yes |
| `DB_NAME` | Database name | shopzone | Yes |
| `DB_USER` | Database user | root | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `EMAIL_USER` | Gmail username | - | Yes |
| `EMAIL_PASS` | Gmail app password | - | Yes |
| `CONTACT_EMAIL` | Contact form recipient | contact@shopzone.com | No |

## 📱 Frontend Pages

- **/** - Product catalog with search and category filtering
- **/login** - User authentication page
- **/signup** - User registration page
- **/cart** - Shopping cart management
- **/checkout** - Order placement process
- **/product** - Individual product details
- **/profile** - User profile and address management
- **/admin** - Admin dashboard for product and order management

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **JWT Authentication**: Stateless authentication with configurable expiration
- **Input Validation**: Server-side validation for all user inputs
- **CORS Protection**: Configured CORS for allowed origins
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **Error Handling**: Comprehensive error handling and logging
- **Role-based Access**: Admin and customer role separation

## 🚀 Deployment

### **Production Considerations**

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure production MySQL database
   - Set up proper email service

2. **Database Migration**
   - Run `mysql_schema.sql` on production database
   - Update connection strings in environment variables

3. **Build Process**
   ```bash
   npm run build
   npm start
   ```

4. **Reverse Proxy**
   - Configure Nginx or Apache for static file serving
   - Set up SSL certificates for HTTPS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Product images sourced from Amazon and Unsplash
- Built with modern web technologies and best practices
- Inspired by real-world e-commerce platforms
- Uses industry-standard security practices

---

**ShopZone** - Your comprehensive e-commerce solution! 🛒✨

*Built with ❤️ using GraphQL, TypeScript, and MySQL*
