CREATE DATABASE IF NOT EXISTS quickbox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quickbox;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('player','owner') DEFAULT 'player',
  phone VARCHAR(20),
  avatar VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expire DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS turfs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  price_per_hour DECIMAL(10,2) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  map_link VARCHAR(500),
  owner_id INT NOT NULL,
  time_slots JSON,
  slot_pricing JSON,
  amenities JSON,
  rating DECIMAL(3,2) DEFAULT 0,
  num_reviews INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_city (city),
  INDEX idx_owner (owner_id)
);

CREATE TABLE IF NOT EXISTS turf_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  turf_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  FOREIGN KEY (turf_id) REFERENCES turfs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS boxes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  turf_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  time_slots JSON,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (turf_id) REFERENCES turfs(id) ON DELETE CASCADE,
  INDEX idx_turf (turf_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  turf_id INT NOT NULL,
  box_id INT NOT NULL,
  date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending','confirmed','cancelled') DEFAULT 'confirmed',
  player_name VARCHAR(255),
  player_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (turf_id) REFERENCES turfs(id) ON DELETE CASCADE,
  FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_turf (turf_id),
  INDEX idx_date (date)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  turf_id INT NOT NULL,
  user_id INT NOT NULL,
  name VARCHAR(255),
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (turf_id) REFERENCES turfs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_review (turf_id, user_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  created_by INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  date DATE NOT NULL,
  time TIME NOT NULL,
  match_type ENUM('Box Cricket','Open Ground') DEFAULT 'Box Cricket',
  sport VARCHAR(50) DEFAULT 'Cricket',
  total_players_needed INT NOT NULL,
  description TEXT,
  status ENUM('open','full','cancelled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_city (city),
  INDEX idx_date (date),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS match_players (
  id INT PRIMARY KEY AUTO_INCREMENT,
  match_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_player (match_id, user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  booking_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner (owner_id)
);

CREATE TABLE IF NOT EXISTS waitlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  turf_id INT NOT NULL,
  date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  user_id INT NOT NULL,
  notified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (turf_id) REFERENCES turfs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_waitlist (turf_id, date, time_slot, user_id)
);

CREATE TABLE IF NOT EXISTS slot_locks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  turf_id INT NOT NULL,
  date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  user_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_lock (turf_id, date, time_slot),
  INDEX idx_expires (expires_at)
);
