USE defaultdb;

CREATE TABLE IF NOT EXISTS user (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  usertype ENUM('user','admin','root') NOT NULL,
  streak TINYINT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL,
  deactivated_at TIMESTAMP NULL,
  profile_picture_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS lesson (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  status ENUM('saved','pending', 'approved', 'rejected', 'suspended') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  created_by_id INT NOT NULL,
  lesson_picture_url VARCHAR(255),
  FOREIGN KEY (created_by_id) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS chapter(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`lesson_id`) REFERENCES lesson(`id`)
);

CREATE TABLE IF NOT EXISTS card(
    id INT AUTO_INCREMENT PRIMARY KEY,
    front TEXT,
    back TEXT,
    display_order TINYINT,
    chapter_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`chapter_id`) REFERENCES chapter(`id`)
);

CREATE TABLE IF NOT EXISTS quiz (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  question TEXT,
  options TEXT,
  correct_answer VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  chapter_id INT NOT NULL,
  FOREIGN KEY (chapter_id) REFERENCES chapter(id)
);

CREATE TABLE IF NOT EXISTS tag (
  name VARCHAR(45) UNIQUE NOT NULL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS lesson_tagging (
  tag_name VARCHAR(45) NOT NULL,
  lesson_id INT NOT NULL,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (tag_name, lesson_id),
  FOREIGN KEY (tag_name) REFERENCES tag(name),
  FOREIGN KEY (lesson_id) REFERENCES lesson(id)
);

CREATE TABLE IF NOT EXISTS friendship (
  user1_id INT NOT NULL,
  user2_id INT NOT NULL,
  status ENUM('pending', 'confirmed') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (user1_id, user2_id),
  FOREIGN KEY (user1_id) REFERENCES user(id),
  FOREIGN KEY (user2_id) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS report(
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('reported', 'closed', 'unresolved', `redirected`) NOT NULL ,
  type ENUM ('critical', 'high','medium','low') NOT NULL,
  reported_by INT NOT NULL,
  remarks TEXT NOT NULL,
  lesson_id INT NOT NULL,
  chapter_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`reported_by`) REFERENCES user(`username`),
  FOREIGN KEY (`lesson_id`) REFERENCES lesson(`id`),
  FOREIGN KEY (`chapter_id`) REFERENCES chapter(`id`)
);