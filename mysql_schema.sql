-- MySQL Database Schema for ShopZone E-commerce

CREATE DATABASE IF NOT EXISTS shopzone;
USE shopzone;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image VARCHAR(255),
  stock INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  shippingAddress TEXT NOT NULL,
  paymentMethod VARCHAR(100) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);

-- Insert sample data

-- Users
INSERT INTO users (id, email, password, firstName, lastName, phone, role, createdAt, updatedAt) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@shopzone.com', '$2a$12$XTZ85.eSXLcLHjfcR451BupF3Poterex5HabScP6FW1h3bLzRtVeK', 'Admin', 'User', '+1234567890', 'admin', '2023-01-01 00:00:00', '2023-01-01 00:00:00'),
('550e8400-e29b-41d4-a716-446655440001', 'customer@shopzone.com', '$2a$12$xa6KsA7a0ujgX/quOzGude47QbljdUxDl70jQ5H161JVDHdfO/Z5O', 'John', 'Doe', '+1987654321', 'customer', '2023-01-01 00:00:00', '2023-01-01 00:00:00');

-- Products
INSERT INTO products (id, name, description, price, category, stock, image, createdAt, updatedAt) VALUES
('1', 'iPhone 14 Pro', 'Latest Apple smartphone with A16 Bionic chip and Dynamic Island', 999.99, 'electronics', 50, 'https://m.media-amazon.com/images/I/61cwywLZR-L._AC_SL1500_.jpg', '2023-01-01 00:00:00', '2023-01-01 00:00:00'),
('4e7019d0-8821-46e4-b797-f889192dffd5', 'Samsung Galaxy S23', 'Latest Android smartphone with advanced camera system and 5G connectivity', 799.99, 'electronics', 40, 'https://m.media-amazon.com/images/I/61U6oC65TTL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('01f8d199-63c0-450c-9c52-7cd81a65f823', 'Sony WH-1000XM4', 'Premium noise-cancelling wireless headphones with 30-hour battery life', 199.99, 'electronics', 35, 'https://m.media-amazon.com/images/I/61D4Z3yKPAL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('c15aa155-4572-4f50-8a56-f111e04950d0', 'iPad Pro 12.9-inch', 'Powerful tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support', 1099.99, 'electronics', 25, 'https://m.media-amazon.com/images/I/81+N4PFF7jS._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('b64570f8-0ea8-4de9-8918-ae3644935f2f', 'Dell XPS 13 Laptop', 'Ultra-portable laptop with Intel Core i7, 16GB RAM, and stunning InfinityEdge display', 1299.99, 'electronics', 20, 'https://m.media-amazon.com/images/I/71UQ8C8YqAL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('baef6908-c7df-4521-aac5-34cc21bc91f8', 'Apple Watch Series 8', 'Advanced smartwatch with health monitoring, GPS, and cellular connectivity', 399.99, 'electronics', 45, 'https://m.media-amazon.com/images/I/71wu+HMAKBL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('3ebd7dd8-f16e-4bf6-9088-5041b3d00479', 'Dune by Frank Herbert', 'Epic science fiction masterpiece - The best-selling science fiction novel of all time', 15.99, 'books', 60, 'https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UY218_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('24e5add1-a97f-4d83-b9f3-6494d62867aa', 'To Kill a Mockingbird', 'Pulitzer Prize-winning novel by Harper Lee about racial injustice and childhood innocence', 14.99, 'books', 80, 'https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UY218_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('c01a3639-6e86-4bba-b346-b75aae18449b', '1984 by George Orwell', 'Dystopian social science fiction novel about totalitarian control and surveillance', 13.99, 'books', 70, 'https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UY218_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('87f04ec5-d9c0-4d35-9c1c-457415edcef6', 'The Catcher in the Rye', 'Coming-of-age novel by J.D. Salinger following teenage rebellion and alienation', 11.99, 'books', 65, 'https://m.media-amazon.com/images/I/81OthjkJBuL._AC_UY218_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('07b9a7ef-e630-4390-98a9-c39d20fc6a2f', 'Pride and Prejudice', 'Jane Austen\'s beloved romance novel about manners, upbringing, morality, and marriage', 10.99, 'books', 90, 'https://m.media-amazon.com/images/I/81NLDvyAHrL._AC_UY218_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('e56680e6-d208-4c1d-9a15-9aff03a1e3e9', 'Harry Potter and the Sorcerer\'s Stone', 'The first book in the Harry Potter series by J.K. Rowling - A magical adventure begins', 9.99, 'books', 120, 'https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_UY218_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('c22786e8-5112-43b4-b23a-4e8a6979040e', 'Nike Air Max 270', 'Comfortable running shoes with Air Max cushioning and breathable mesh upper', 129.99, 'clothing', 75, 'https://m.media-amazon.com/images/I/71VaQ+VnLWL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('1978d46e-8f65-48c7-a2be-a3eb7c767abc', 'Levi\'s 501 Jeans', 'Classic straight-fit denim jeans - The original blue jean since 1873', 59.99, 'clothing', 90, 'https://m.media-amazon.com/images/I/81f5PF9bfIL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('25f3089c-e11d-4f69-8f4b-0a8561162d05', 'Adidas Ultraboost 22', 'High-performance running shoes with Boost technology and responsive cushioning', 189.99, 'clothing', 55, 'https://m.media-amazon.com/images/I/81ExJVA4hML._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('909681a3-c1be-478c-9c6c-a8126be60697', 'H&M Cotton T-Shirt', 'Soft and comfortable basic t-shirt made from 100% organic cotton', 12.99, 'clothing', 120, 'https://m.media-amazon.com/images/I/71p4vODhgOL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('2054e5d5-a9b9-45e2-b3ac-b85421776383', 'Zara Wool Coat', 'Elegant wool blend coat with classic design and premium fabric quality', 149.99, 'clothing', 35, 'https://m.media-amazon.com/images/I/71yZQH8Q8JL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('89c4a575-97c2-4512-b32f-4f3c02985dc7', 'Uniqlo Down Jacket', 'Lightweight and warm down jacket with water-resistant finish and packable design', 79.99, 'clothing', 60, 'https://m.media-amazon.com/images/I/71r7eWuCsaL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('9bf6d132-b92d-4ee0-9a29-8931368549f9', 'Breville Coffee Maker', 'Programmable drip coffee maker with thermal carafe and customizable settings', 79.99, 'home', 40, 'https://m.media-amazon.com/images/I/71rG+eBcxtL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('9e9b8ad8-75b1-471d-8e41-89c7b455b762', 'LED Desk Lamp', 'Adjustable LED desk lamp with USB charging port and touch controls', 39.99, 'home', 45, 'https://m.media-amazon.com/images/I/61Vzq3qE7xL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('19224c98-0a9b-4819-8634-68ac5eae797d', 'KitchenAid Stand Mixer', 'Professional-grade stand mixer with 10 speeds, multiple attachments, and 5-quart bowl', 379.99, 'home', 15, 'https://m.media-amazon.com/images/I/81O9VyTxsCL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('570e3107-2205-482c-9e0b-f5df4376c929', 'Dyson Vacuum Cleaner', 'Cordless stick vacuum with powerful suction, HEPA filtration, and up to 60 minutes runtime', 599.99, 'home', 20, 'https://m.media-amazon.com/images/I/71uVOEHJ6JL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('2895a09f-7c49-41f1-8790-27421c87cda6', 'Instant Pot Duo', '7-in-1 electric pressure cooker with sauté, slow cook, rice cooker, steamer, and warmer functions', 89.99, 'home', 50, 'https://m.media-amazon.com/images/I/71c2huUeOIL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('dd3c255c-3ca5-42be-b8cb-8c46dafc3c18', 'Casper Memory Foam Mattress', 'Premium memory foam mattress with cooling technology and 100-night trial', 999.99, 'home', 10, 'https://m.media-amazon.com/images/I/81eB+7+CXL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('b0fcdc3c-1627-4f99-9918-b56f8f41a09b', 'Peloton Bike', 'Interactive exercise bike with HD touchscreen, live and on-demand classes', 2495.00, 'sports', 5, 'https://m.media-amazon.com/images/I/81f5PF9bfIL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('a5d27595-0b66-404d-8420-f254dff974ce', 'Yoga Mat', 'Non-slip yoga mat made from natural rubber with excellent grip and cushioning', 29.99, 'sports', 80, 'https://m.media-amazon.com/images/I/71VaQ+VnLWL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('475c6bc3-01ef-4e8c-9a54-2ffafe810553', 'Dumbbell Set', 'Adjustable dumbbell set with weights from 5-50 lbs, perfect for home workouts', 199.99, 'sports', 25, 'https://m.media-amazon.com/images/I/81ExJVA4hML._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('3913fd12-629a-4fb3-830d-43f714ce14f9', 'Tennis Racket', 'Professional tennis racket with graphite construction and oversized head for power', 149.99, 'sports', 40, 'https://m.media-amazon.com/images/I/71p4vODhgOL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('9294e138-65f5-4934-a2e3-d140c75c4dd3', 'Swimming Goggles', 'Anti-fog swimming goggles with UV protection and comfortable silicone seal', 19.99, 'sports', 100, 'https://m.media-amazon.com/images/I/71yZQH8Q8JL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('4d816147-6ca8-4a0d-8d4c-121db6cf577e', 'Foam Roller', 'High-density foam roller for muscle recovery and myofascial release', 24.99, 'sports', 70, 'https://m.media-amazon.com/images/I/71r7eWuCsaL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('dd494f96-368e-41a3-bf80-b8ef5fbe5a51', 'LEGO Creator Set', 'Creative building set with 3-in-1 model designs and step-by-step instructions', 49.99, 'toys', 60, 'https://m.media-amazon.com/images/I/81O9VyTxsCL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('7f30ba14-43bf-4853-a37a-0981c9f93d93', 'Barbie Dreamhouse', 'Dollhouse with elevator, pool, and multiple rooms for endless imaginative play', 199.99, 'toys', 15, 'https://m.media-amazon.com/images/I/71uVOEHJ6JL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('2c3513fb-71c8-4f6f-bf6d-4c0425901e1a', 'Hot Wheels Track', 'Expandable racetrack set with loops, jumps, and stunt features for racing fun', 39.99, 'toys', 45, 'https://m.media-amazon.com/images/I/71c2huUeOIL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('55d32bdd-3fe2-4c6a-a207-f877ebf9bd51', 'Puzzle 1000 Pieces', 'Challenging jigsaw puzzle with beautiful landscape scene and sturdy pieces', 14.99, 'toys', 85, 'https://m.media-amazon.com/images/I/81eB+7+CXL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('e19d8ff2-34dc-4b94-80d8-3a41d4c5b044', 'Remote Control Car', 'High-speed RC car with rechargeable battery and 2.4GHz remote control', 59.99, 'toys', 30, 'https://m.media-amazon.com/images/I/81f5PF9bfIL._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55'),
('fe667c7c-2055-45d5-879d-9944fc7a3404', 'Board Game - Monopoly', 'Classic property trading board game for the whole family with modern updates', 24.99, 'toys', 50, 'https://m.media-amazon.com/images/I/81ExJVA4hML._AC_SL1500_.jpg', '2025-10-01 18:32:55', '2025-10-01 18:32:55');
