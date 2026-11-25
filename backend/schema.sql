-- Lost-It database schema
-- Run with:  python init_db.py

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    icon VARCHAR(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE locations (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    type        ENUM('lost', 'found') NOT NULL,
    title       VARCHAR(120) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    location_id INT NOT NULL,
    item_date   DATE NOT NULL,
    image       VARCHAR(255),
    reward      VARCHAR(60),
    status      ENUM('open', 'resolved') NOT NULL DEFAULT 'open',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX idx_items_match (type, category_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE messages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    item_id     INT NOT NULL,
    sender_id   INT NOT NULL,
    receiver_id INT NOT NULL,
    body        TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id)     REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lookup data
INSERT INTO categories (name, icon) VALUES
    ('Electronics', '📱'),
    ('ID Cards & Documents', '🪪'),
    ('Keys', '🔑'),
    ('Bags', '🎒'),
    ('Books & Notes', '📚'),
    ('Clothing', '🧥'),
    ('Wallets & Money', '👛'),
    ('Accessories', '⌚'),
    ('Bottles & Lunch Boxes', '🥤'),
    ('Other', '📦');

INSERT INTO locations (name) VALUES
    ('Main Library'),
    ('Central Canteen'),
    ('Computer Lab'),
    ('Auditorium'),
    ('Sports Ground'),
    ('Parking Area'),
    ('Classroom Block'),
    ('Admin Block'),
    ('Hostel'),
    ('Bus Stop'),
    ('Other');
