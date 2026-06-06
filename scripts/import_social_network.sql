-- ============================================================
-- Base de donnees du projet Social Network
-- Fichier d'import pour MySQL / phpMyAdmin / MySQL Workbench
-- Base cible : social_network_db
-- Compte admin de demonstration :
--   Email       : admin@example.com
--   Mot de passe: Admin1234!
-- ============================================================

CREATE DATABASE IF NOT EXISTS social_network_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE social_network_db;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT '/images/default-avatar.svg',
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    bio TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NULL,
    image VARCHAR(255) NULL,
    shared_post_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_posts_shared_post
        FOREIGN KEY (shared_post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id),
    CONSTRAINT fk_likes_post
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_share (post_id, user_id),
    CONSTRAINT fk_shares_post
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_shares_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS friends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id_1 INT NOT NULL,
    user_id_2 INT NOT NULL,
    status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_friendship (user_id_1, user_id_2),
    CONSTRAINT fk_friends_user_1
        FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friends_user_2
        FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_no_self_friendship
        CHECK (user_id_1 <> user_id_2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender_id INT NOT NULL,
    type ENUM('like','comment','friend_request','message') NOT NULL,
    related_id INT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Index utiles pour accelerer les recherches et les affichages frequents.
DROP PROCEDURE IF EXISTS add_index_if_missing;
DELIMITER $$
CREATE PROCEDURE add_index_if_missing(
    IN tableName VARCHAR(64),
    IN indexName VARCHAR(64),
    IN indexDefinition VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = tableName
          AND INDEX_NAME = indexName
    ) THEN
        SET @sql = CONCAT('CREATE INDEX ', indexName, ' ON ', tableName, ' ', indexDefinition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

CALL add_index_if_missing('posts', 'idx_posts_user_created', '(user_id, created_at)');
CALL add_index_if_missing('comments', 'idx_comments_post_created', '(post_id, created_at)');
CALL add_index_if_missing('friends', 'idx_friends_users_status', '(user_id_1, user_id_2, status)');
CALL add_index_if_missing('messages', 'idx_messages_conversation', '(sender_id, receiver_id, created_at)');
CALL add_index_if_missing('notifications', 'idx_notifications_user_read', '(user_id, is_read, created_at)');

DROP PROCEDURE IF EXISTS add_index_if_missing;

-- Donnees de demonstration.
-- Le mot de passe est deja hache avec bcrypt.
INSERT INTO users (fullname, email, password, profile_picture, role, bio)
VALUES (
    'Administrateur',
    'admin@example.com',
    '$2b$10$oGW8QwOLHpwt/WxsSwn4seD9.CGZk5i6IhaDNySVUJ4abMkbEPfju',
    '/images/default-avatar.svg',
    'admin',
    'Compte administrateur de demonstration.'
)
ON DUPLICATE KEY UPDATE
    fullname = VALUES(fullname),
    role = 'admin',
    profile_picture = VALUES(profile_picture);

INSERT INTO users (fullname, email, password, profile_picture, role, bio)
VALUES (
    'Utilisateur Demo',
    'user@example.com',
    '$2b$10$oGW8QwOLHpwt/WxsSwn4seD9.CGZk5i6IhaDNySVUJ4abMkbEPfju',
    '/images/default-avatar.svg',
    'user',
    'Compte utilisateur pour tester les publications et les messages.'
)
ON DUPLICATE KEY UPDATE
    fullname = VALUES(fullname),
    role = 'user',
    profile_picture = VALUES(profile_picture);

INSERT INTO posts (user_id, content, image)
SELECT id, 'Bienvenue sur Social Network ! Ceci est une publication de demonstration.', NULL
FROM users
WHERE email = 'admin@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE u.email = 'admin@example.com'
        AND p.content = 'Bienvenue sur Social Network ! Ceci est une publication de demonstration.'
  );
