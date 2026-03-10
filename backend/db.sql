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
  quiz_type ENUM('mcq', 'true_false', 'fill_blank') NOT NULL DEFAULT 'mcq',
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

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  user_id          INT NOT NULL,
  lesson_id        INT NOT NULL,
  status           ENUM('in_progress','completed') NOT NULL DEFAULT 'in_progress',
  started_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at     TIMESTAMP NULL,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (user_id)   REFERENCES user(id),
  FOREIGN KEY (lesson_id) REFERENCES lesson(id)
);

CREATE TABLE IF NOT EXISTS user_card_progress (
  user_id      INT NOT NULL,
  card_id      INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, card_id),
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (card_id) REFERENCES card(id)
);

-- ============================================================
-- Sample progress data for user_id = 1, lesson_id = 1
-- Chapter 1 (id 3): cards 4,5,6,7         — ALL done + quiz done (via quiz_result) → 100%
-- Chapter 2 (id 4): cards 8,9,10,11,12,13 — 4/6 done, no quiz    → partial
-- Chapter 3 (id 6): cards 14,15,16,17,18,19,20 — not started      → 0%
-- Quiz completion is derived from quiz_result table (row exists = done)
-- ============================================================

-- Lesson-level: user 1 has started lesson 1
INSERT INTO user_lesson_progress (user_id, lesson_id, status) VALUES
(1, 1, 'in_progress');

-- Chapter 1 (id 3): all 4 cards completed
INSERT INTO user_card_progress (user_id, card_id) VALUES
(1, 4),
(1, 5),
(1, 6),
(1, 7);

-- Chapter 2 (id 4): 4 out of 6 cards completed
INSERT INTO user_card_progress (user_id, card_id) VALUES
(1, 8),
(1, 9),
(1, 10),
(1, 11);

-- Chapter 3 (id 6): nothing completed (no rows)
-- Quiz result for chapter 1 already exists in quiz_result table (id=1, user_id=1, chapter_id=3)