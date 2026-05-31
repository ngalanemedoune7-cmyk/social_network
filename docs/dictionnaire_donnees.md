# Dictionnaire de données (MySQL) — social_network_db

Base : **social_network_db**

## users
- **id** (INT, PK, AUTO_INCREMENT)
- **fullname** (VARCHAR(255), NOT NULL)
- **email** (VARCHAR(255), NOT NULL, UNIQUE)
- **password** (VARCHAR(255), NOT NULL) — hash bcrypt
- **profile_picture** (VARCHAR(255), DEFAULT 'default_profile.png') — chemin/nom fichier
- **created_at** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## posts
- **id** (INT, PK, AUTO_INCREMENT)
- **user_id** (INT, FK → users.id, NOT NULL)
- **content** (TEXT, NULL) — texte de la publication
- **image** (VARCHAR(255), NULL) — chemin/nom image
- **created_at** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## comments
- **id** (INT, PK, AUTO_INCREMENT)
- **post_id** (INT, FK → posts.id, NOT NULL)
- **user_id** (INT, FK → users.id, NOT NULL)
- **content** (TEXT, NOT NULL)
- **created_at** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## likes
- **id** (INT, PK, AUTO_INCREMENT)
- **post_id** (INT, FK → posts.id, NOT NULL)
- **user_id** (INT, FK → users.id, NOT NULL)
- **created_at** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- **UNIQUE (post_id, user_id)** via `unique_like`

## friends
- **id** (INT, PK, AUTO_INCREMENT)
- **user_id_1** (INT, FK → users.id, NOT NULL)
- **user_id_2** (INT, FK → users.id, NOT NULL)
- **status** (ENUM('pending','accepted','declined'), DEFAULT 'pending')
- **created_at** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## messages
- **id** (INT, PK, AUTO_INCREMENT)
- **sender_id** (INT, FK → users.id, NOT NULL)
- **receiver_id** (INT, FK → users.id, NOT NULL)
- **message** (TEXT, NOT NULL)
- **created_at** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## notifications
- **id** (INT, PK, AUTO_INCREMENT)
- **user_id** (INT, FK → users.id, NOT NULL) — destinataire
- **sender_id** (INT, FK → users.id, NOT NULL) — émetteur
- **type** (ENUM('like','comment','friend_request','message'), NOT NULL)
- **related_id** (INT, NULL) — id du post/comment/message lié
- **is_read** (TINYINT(1), DEFAULT 0)
- **created_at** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## shares
- **id** (INT, PK, AUTO_INCREMENT)
- **post_id** (INT, FK → posts.id, NOT NULL)
- **user_id** (INT, FK → users.id, NOT NULL)
- **created_at** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

