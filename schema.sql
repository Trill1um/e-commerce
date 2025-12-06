-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  colony_name VARCHAR(50),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(1024) NOT NULL,
  facebook_link VARCHAR(255),
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

-- Temp users table (for email verification)
CREATE TABLE temp_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  colony_name VARCHAR(50),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(1024) NOT NULL,
  facebook_link VARCHAR(255),
  role ENUM('seller', 'buyer') DEFAULT 'buyer',
  code VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 20 MINUTE),
  
  CHECK (email REGEXP '^[^@]+@[^@]+\\.[^@]+$')
);

CREATE INDEX idx_temp_expires ON temp_users(expires_at);