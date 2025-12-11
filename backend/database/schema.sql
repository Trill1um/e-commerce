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
    seller_id INT NOT NULL,
    code INT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    is_limited BOOLEAN NOT NULL DEFAULT FALSE,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES USER(id) ON DELETE CASCADE,
    PRIMARY KEY (code, seller_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_category (category),
    INDEX idx_price (price)
);

CREATE TABLE INFO (
    info_index INT NOT NULL,
    seller_id INT NOT NULL,
    code INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1024) NOT NULL,
    FOREIGN KEY (code, seller_id) REFERENCES PRODUCT(code, seller_id) ON DELETE CASCADE,
    PRIMARY KEY (info_index, code, seller_id),
    INDEX idx_product_id (code, seller_id)
);

CREATE TABLE IMAGE (
    image_index INT NOT NULL,
    seller_id INT NOT NULL,
    code INT NOT NULL,
    FOREIGN KEY (code, seller_id) REFERENCES PRODUCT(code, seller_id) ON DELETE CASCADE,
    PRIMARY KEY (image_index, code, seller_id),
    image_url VARCHAR(2048),
    INDEX idx_product_id (code, seller_id)
);

CREATE TABLE RATING (
    seller_id INT NOT NULL,
    code INT NOT NULL,
    user_id INT NOT NULL,
    score INT NOT NULL CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code, seller_id) REFERENCES PRODUCT(code, seller_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER(id) ON DELETE CASCADE,
    PRIMARY KEY (code, seller_id, user_id),
    INDEX idx_product_id (code, seller_id),
    INDEX idx_user_id (user_id)
);
