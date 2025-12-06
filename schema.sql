-- Users table
CREATE DATABASE IF NOT EXISTS mern_db;
USE mern_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  colony_name VARCHAR(50),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(1024) NOT NULL,
  role ENUM('seller', 'buyer') DEFAULT 'buyer',
  code VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Conditional validation done in application layer
  CHECK (email REGEXP '^[^@]+@[^@]+\\.[^@]+$'),
  CHECK (CHAR_LENGTH(email) >= 5 AND CHAR_LENGTH(email) <= 100),
  CHECK (CHAR_LENGTH(password) >= 6),
  CHECK (colony_name IS NULL OR (CHAR_LENGTH(colony_name) >= 2 AND CHAR_LENGTH(colony_name) <= 50))
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    is_limited BOOLEAN NOT NULL DEFAULT FALSE,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    rate_score DECIMAL(3, 2) DEFAULT 0.00,
    rate_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id),
    INDEX idx_category (category),
    INDEX idx_price (price)
);

CREATE TABLE additional_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1024) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
);

CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(2048),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
);

CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    score INT NOT NULL CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rating (product_id, user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id)
);
