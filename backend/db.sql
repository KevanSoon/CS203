USE defaultdb;

CREATE TABLE IF NOT EXISTS user(
  username varchar(45) UNIQUE NOT NULL PRIMARY KEY,
  email varchar(100) NOT NULL,
  password varchar(100) NOT NULL,
  usertype ENUM('user','admin','root') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deactivated_at TIMESTAMP NULL
);

-- user1 is requestor, user2 is acceptor 
CREATE TABLE IF NOT EXISTS friendship(
    username1 varchar(45) NOT NULL,
    username2 varchar(45) NOT NULL,
    status ENUM('pending', 'confirmed'),
    PRIMARY KEY (username1, username2),
    FOREIGN KEY (`username1`) REFERENCES user(`username`),
    FOREIGN KEY (`username2`) REFERENCES user(`username`)
);