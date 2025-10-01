# 🛒 ShopZone - Simplified E-commerce Platform

A modern, full-stack e-commerce application built with GraphQL, Node.js, and TypeScript. Features user authentication, product catalog, shopping cart, and order management with a clean, responsive frontend.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login/signup with JWT tokens
- **Product Catalog**: Browse products by category (Electronics, Books, Clothing, Home, Sports, Toys)
- **Shopping Cart**: Add/remove items, update quantities
- **Order Management**: Place orders, view order history
- **Admin Panel**: Manage products and users (admin role)
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **GraphQL API**: Efficient data fetching with Apollo Server
- **JSON File Database**: Simple, file-based data storage (no external DB required)
- **TypeScript**: Full type safety throughout the application
- **Real Product Images**: All products use actual Amazon product images
- **Email Integration**: Contact form with email sending capability

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Apollo Server** - GraphQL server
- **TypeScript** - Type-safe JavaScript
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending

### Frontend
- **HTML5/CSS3** - Modern markup and styling
- **JavaScript (ES6+)** - Client-side logic
- **Apollo Client** - GraphQL client
- **Responsive Design** - Mobile-first approach

### Database
- **JSON File Storage** - Simple file-based database (db.json)
- **No external dependencies** - Works out of the box

## 📁 Project Structure

```
shopzone-ecommerce/
├── server/                    # Backend server
│   ├── index.ts              # Main server file
│   ├── schema.ts             # GraphQL schema & resolvers
│   └── database/
│       └── setup.ts          # Database initialization & seeding
├── public/                   # Frontend static files
│   ├── index.html            # Main shopping page
│   ├── login.html            # Login page
│   ├── signup.html           # Signup page
│   ├── cart.html             # Shopping cart page
│   ├── admin.html            # Admin panel
│   ├── graphql.js            # GraphQL client setup
│   └── styles/               # CSS stylesheets
├── db.json                   # JSON database file
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopzone-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=4001
   JWT_SECRET=your-super-secret-jwt-key-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CONTACT_EMAIL=contact@shopzone.com
   ```

4. **Set up the database**
   ```bash
   npm run db:setup
   ```
   This creates `db.json` with sample users and 55 products.

5. **Start the development server**
   ```bash
   npm run dev
   ```

   This starts both the backend server (port 4001) and frontend (port 3000).

### Accessing the Application

- **Frontend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:4001/graphql
- **Health Check**: http://localhost:4001/health

### Demo Accounts

- **Admin**: admin@shopzone.com / admin123
- **Customer**: customer@shopzone.com / customer123

## 📡 API Documentation

### GraphQL Schema

The API uses GraphQL with the following main types:

#### Queries
```graphql
# Authentication
me: User

# Products
products(limit: Int, offset: Int, category: String): [Product!]!
product(id: ID!): Product

# Cart & Orders
cart: [CartItem!]!
orders: [Order!]!
order(id: ID!): Order
```

#### Mutations
```graphql
# Authentication
login(email: String!, password: String!): AuthPayload!
signup(email: String!, password: String!, firstName: String!, lastName: String!): AuthPayload!

# Cart
addToCart(productId: ID!, quantity: Int!): CartItem!
updateCartItem(id: ID!, quantity: Int!): CartItem!
removeFromCart(id: ID!): Boolean!

# Orders
checkout: Order!
```

#### Types
```graphql
type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  role: String!
  createdAt: String!
  updatedAt: String!
}

type Product {
  id: ID!
  name: String!
  description: String!
  price: Float!
  category: String!
  image: String
  stock: Int!
  createdAt: String!
  updatedAt: String!
}

type CartItem {
  id: ID!
  product: Product!
  quantity: Int!
  createdAt: String!
}

type Order {
  id: ID!
  user: User!
  items: [OrderItem!]!
  total: Float!
  status: String!
  createdAt: String!
}

type OrderItem {
  id: ID!
  product: Product!
  quantity: Int!
  price: Float!
}
```

## 🗂️ Database Schema

The application uses a JSON file-based database with the following structure:

```json
{
  "users": [...],
  "products": [...],
  "cart_items": [...],
  "orders": [...],
  "order_items": [...]
}
```

### Sample Data
- **Users**: 2 (1 admin, 1 customer)
- **Products**: 55 products across 6 categories
- **Categories**: electronics, books, clothing, home, sports, toys

## 🔧 Development

### Available Scripts

```bash
# Development (backend + frontend)
npm run dev

# Backend only
npm run server:dev

# Frontend only
npm run client:dev

# Build for production
npm run build

# Start production server
npm start

# Database setup
npm run db:setup
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4001 |
| `JWT_SECRET` | JWT signing secret | Required |
| `EMAIL_USER` | Gmail username for email | Required |
| `EMAIL_PASS` | Gmail app password | Required |
| `CONTACT_EMAIL` | Contact form recipient | contact@shopzone.com |

## 📱 Frontend Pages

- **/** - Product catalog with search and filtering
- **/login** - User login page
- **/signup** - User registration page
- **/cart** - Shopping cart management
- **/admin** - Admin panel (products/users management)

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Stateless authentication with tokens
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for allowed origins
- **Error Handling**: Comprehensive error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Product images sourced from Amazon
- Built with modern web technologies
- Inspired by real-world e-commerce platforms

---

**ShopZone** - Your simplified e-commerce solution! 🛒✨
