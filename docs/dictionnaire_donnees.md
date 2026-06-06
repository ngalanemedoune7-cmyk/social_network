# Dictionnaire de données

Base: `social_network_db`

## users

| Champ | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Identifiant utilisateur |
| fullname | VARCHAR(120) | NOT NULL | Nom complet |
| email | VARCHAR(160) | NOT NULL, UNIQUE | Adresse email |
| password | VARCHAR(255) | NOT NULL | Mot de passe hashé avec bcrypt |
| profile_picture | VARCHAR(255) | DEFAULT | Avatar |
| role | ENUM('user','admin') | DEFAULT 'user' | Rôle applicatif |
| bio | TEXT | NULL | Description du profil |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | AUTO UPDATE | Dernière modification |

## posts

| Champ | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Identifiant publication |
| user_id | INT | FK users.id | Auteur |
| content | TEXT | NULL | Texte |
| image | VARCHAR(255) | NULL | Image jointe |
| shared_post_id | INT | FK posts.id, NULL | Publication partagée |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | AUTO UPDATE | Dernière modification |

## comments

| Champ | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Identifiant commentaire |
| post_id | INT | FK posts.id | Publication commentée |
| user_id | INT | FK users.id | Auteur |
| content | TEXT | NOT NULL | Contenu |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date |

## likes

| Champ | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Identifiant réaction |
| post_id | INT | FK posts.id, UNIQUE avec user_id | Publication |
| user_id | INT | FK users.id, UNIQUE avec post_id | Utilisateur |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date |

## shares

| Champ | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Identifiant partage |
| post_id | INT | FK posts.id, UNIQUE avec user_id | Publication |
| user_id | INT | FK users.id, UNIQUE avec post_id | Utilisateur |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date |

## friends

| Champ | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Identifiant relation |
| user_id_1 | INT | FK users.id | Demandeur |
| user_id_2 | INT | FK users.id | Destinataire |
| status | ENUM('pending','accepted','rejected') | DEFAULT 'pending' | État |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de demande |
| updated_at | TIMESTAMP | AUTO UPDATE | Dernière modification |

## messages

| Champ | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Identifiant message |
| sender_id | INT | FK users.id | Expéditeur |
| receiver_id | INT | FK users.id | Destinataire |
| message | TEXT | NOT NULL | Contenu |
| is_read | TINYINT(1) | DEFAULT 0 | Lecture |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date |

## notifications

| Champ | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Identifiant notification |
| user_id | INT | FK users.id | Destinataire |
| sender_id | INT | FK users.id | Émetteur |
| type | ENUM('like','comment','friend_request','message') | NOT NULL | Type |
| related_id | INT | NULL | Référence métier |
| is_read | TINYINT(1) | DEFAULT 0 | Lecture |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date |
