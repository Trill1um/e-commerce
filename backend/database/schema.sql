-- Users table
CREATE DATABASE IF NOT EXISTS mern_db;
USE mern_db;

CREATE TABLE USER (
  id INT AUTO_INCREMENT PRIMARY KEY,
  colony_name VARCHAR(50),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(1024) NOT NULL,
  role ENUM('seller', 'buyer', 'admin') DEFAULT 'buyer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Conditional validation done in application layer
  CHECK (email REGEXP '^[^@]+@[^@]+\\.[^@]+$'),
  CHECK (CHAR_LENGTH(email) >=10 AND CHAR_LENGTH(email) <= 100),
  CHECK (CHAR_LENGTH(password) >= 6),
  CHECK (colony_name IS NULL OR (CHAR_LENGTH(colony_name) >= 2 AND CHAR_LENGTH(colony_name) <= 50))
);

CREATE TABLE PRODUCT (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    is_limited BOOLEAN NOT NULL DEFAULT FALSE,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES USER(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id),
    INDEX idx_category (category),
    INDEX idx_price (price)
);

CREATE TABLE INFO (
    info_index INT NOT NULL,
    product_id INT NOT NULL,
    PRIMARY KEY (info_index, product_id),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1024) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
);

CREATE TABLE IMAGE (
    image_index INT NOT NULL,
    product_id INT NOT NULL,
    PRIMARY KEY (image_index, product_id),
    image_url VARCHAR(2048),
    FOREIGN KEY (product_id) REFERENCES PRODUCT(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
);

CREATE TABLE RATING (
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (product_id, user_id),
    score INT NOT NULL CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id)
);
