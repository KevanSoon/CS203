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
