CREATE DATABASE IF NOT EXISTS user_registration;

USE user_registration;

-- User table
CREATE TABLE IF NOT EXISTS user (
  username VARCHAR(50) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rental unit table
CREATE TABLE IF NOT EXISTS rental_unit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  features TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (username) REFERENCES user(username)
);

-- Daily rental post counter table
CREATE TABLE IF NOT EXISTS user_rental_count (
  username VARCHAR(50) NOT NULL,
  post_date DATE NOT NULL,
  count INT DEFAULT 0,
  PRIMARY KEY (username, post_date),
  FOREIGN KEY (username) REFERENCES user(username)
);

-- Review table
CREATE TABLE IF NOT EXISTS review (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rental_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  rating ENUM('excellent', 'good', 'fair', 'poor') NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rental_id) REFERENCES rental_unit(id),
  FOREIGN KEY (username) REFERENCES user(username),
  UNIQUE KEY unique_review (rental_id, username)
);

-- Daily review counter table
CREATE TABLE IF NOT EXISTS user_review_count (
  username VARCHAR(50) NOT NULL,
  post_date DATE NOT NULL,
  count INT DEFAULT 0,
  PRIMARY KEY (username, post_date),
  FOREIGN KEY (username) REFERENCES user(username)
);