USE defaultdb;

CREATE TABLE IF NOT EXISTS user(
  username varchar(50) UNIQUE NOT NULL PRIMARY KEY,
  email varchar(100) NOT NULL,
  password varchar(100) NOT NULL,
  usertype ENUM('user','admin','root') NOT NULL,
  streak TINYINT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL,
  deactivated_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS lesson(
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  status ENUM('saved','pending', 'approved', 'rejected'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);


CREATE TABLE IF NOT EXISTS chapter(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS card(
    id INT AUTO_INCREMENT PRIMARY KEY,
    front TEXT,
    back TEXT,
    display_order TINYINT,
    lesson_id INT NOT NULL,
    chapter_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_lesson_chapter (`lesson_id`, `chapter_id`),
    FOREIGN KEY (`lesson_id`) REFERENCES lesson(`id`),
    FOREIGN KEY (`chapter_id`) REFERENCES chapter(`id`)
);

CREATE TABLE IF NOT EXISTS quiz(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    question TEXT,
    options TEXT,
    correct_answer VARCHAR(255),
    card_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`card_id`) REFERENCES card(`id`)
);