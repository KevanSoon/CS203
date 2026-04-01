SET time_zone = '+08:00';

-- ====================================
-- DROP TABLES (child tables first)
-- ====================================

DROP TABLE IF EXISTS `user_card_progress`;
DROP TABLE IF EXISTS `user_lesson_progress`;
DROP TABLE IF EXISTS `lesson_tagging`;
DROP TABLE IF EXISTS `quiz_result`;
DROP TABLE IF EXISTS `review`;
DROP TABLE IF EXISTS `report`;
DROP TABLE IF EXISTS `quiz`;
DROP TABLE IF EXISTS `card`;
DROP TABLE IF EXISTS `chapter`;
DROP TABLE IF EXISTS `lesson`;
DROP TABLE IF EXISTS `friendship`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `tag`;
DROP TABLE IF EXISTS `user`;

-- ====================================
-- CREATE TABLES
-- ====================================

CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(25) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `usertype` enum('user','admin','root') NOT NULL,
  `streak` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `deactivated_at` timestamp NULL DEFAULT NULL,
  `profile_picture_url` varchar(255) DEFAULT NULL,
  `last_streak_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
);

CREATE TABLE `tag` (
  `name` varchar(45) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
);

CREATE TABLE `lesson` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` varchar(255),
  `status` enum('saved','pending','approved','rejected','suspended') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by_id` int NOT NULL,
  `lesson_picture_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`),
  KEY `fk_lesson_created_by_id` (`created_by_id`),
  CONSTRAINT `fk_lesson_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`)
);

CREATE TABLE `chapter` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` varchar(255),
  `lesson_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `chapter_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id`)
);

CREATE TABLE `card` (
  `id` int NOT NULL AUTO_INCREMENT,
  `front` varchar(150),
  `back` varchar(150),
  `display_order` tinyint DEFAULT NULL,
  `chapter_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `chapter_id` (`chapter_id`),
  CONSTRAINT `card_ibfk_1` FOREIGN KEY (`chapter_id`) REFERENCES `chapter` (`id`)
);

CREATE TABLE `quiz` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `question` varchar(150),
  `quiz_type` enum('mcq','true_false','fill_blank') NOT NULL DEFAULT 'mcq',
  `options` text,
  `correct_answer` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `chapter_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quiz_ibfk_2` (`chapter_id`),
  CONSTRAINT `quiz_ibfk_2` FOREIGN KEY (`chapter_id`) REFERENCES `chapter` (`id`)
);

CREATE TABLE `user_card_progress` (
  `user_id` int NOT NULL,
  `card_id` int NOT NULL,
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`card_id`),
  KEY `card_id` (`card_id`),
  CONSTRAINT `user_card_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `user_card_progress_ibfk_2` FOREIGN KEY (`card_id`) REFERENCES `card` (`id`)
);

CREATE TABLE `user_lesson_progress` (
  `user_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `status` enum('in_progress','completed') NOT NULL DEFAULT 'in_progress',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `last_accessed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `user_lesson_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `user_lesson_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id`)
);

CREATE TABLE `lesson_tagging` (
  `tag_name` varchar(45) NOT NULL,
  `lesson_id` int NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`tag_name`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `lesson_tagging_ibfk_1` FOREIGN KEY (`tag_name`) REFERENCES `tag` (`name`),
  CONSTRAINT `lesson_tagging_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id`)
);

CREATE TABLE `friendship` (
  `status` enum('pending','confirmed') NOT NULL DEFAULT 'pending',
  `user1_id` int NOT NULL,
  `user2_id` int NOT NULL,
  PRIMARY KEY (`user1_id`,`user2_id`),
  KEY (`user2_id`),
  CONSTRAINT fk_user_1 FOREIGN KEY (`user1_id`) REFERENCES `user` (`id`),
  CONSTRAINT fk_user_2 FOREIGN KEY (`user2_id`) REFERENCES `user` (`id`)
);

CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `otp` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);

CREATE TABLE `quiz_result` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `chapter_id` int NOT NULL,
  `score` double NOT NULL,
  `taken_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `attempts` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `chapter_id` (`chapter_id`),
  CONSTRAINT `quiz_result_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `quiz_result_ibfk_2` FOREIGN KEY (`chapter_id`) REFERENCES `chapter` (`id`)
);

CREATE TABLE `report` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` enum('reported','closed','unresolved') DEFAULT NULL,
  `type` enum('critical','high','medium','low') NOT NULL,
  `remarks` varchar(255),
  `reported_by` int NOT NULL,
  `lesson_id` int NOT NULL,
  `chapter_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_update` enum('admin','root') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reported_by` (`reported_by`),
  KEY `lesson_id` (`lesson_id`),
  KEY `chapter_id` (`chapter_id`),
  CONSTRAINT `report_ibfk_1` FOREIGN KEY (`reported_by`) REFERENCES `user` (`id`),
  CONSTRAINT `report_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id`),
  CONSTRAINT `report_ibfk_3` FOREIGN KEY (`chapter_id`) REFERENCES `chapter` (`id`)
);

CREATE TABLE `review` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rating` int NOT NULL,
  `feedback` varchar(255) DEFAULT NULL,
  `reviewed_by` int NOT NULL,
  `lesson_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review` (`reviewed_by`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `review_ibfk_1` FOREIGN KEY (`reviewed_by`) REFERENCES `user` (`id`),
  CONSTRAINT `review_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`id`),
  CONSTRAINT `review_chk_1` CHECK ((`rating` between 1 and 5))
);