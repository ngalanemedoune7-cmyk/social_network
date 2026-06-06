# Rapport complet du projet Social Network

## 1. Présentation générale

Le projet **Social Network** est une application web dynamique de réseau social conçue avec une séparation claire entre le frontend, le backend et la base de données. L’objectif principal est de permettre à des utilisateurs de créer un compte, publier du contenu, interagir avec d’autres membres, échanger des messages privés en temps réel, recevoir des notifications et administrer la plateforme.

L’application respecte les technologies imposées :

- **Frontend** : HTML5, CSS3, JavaScript Vanilla.
- **Backend** : Node.js avec Express.js.
- **Base de données** : MySQL.
- **Temps réel** : Socket.IO.
- **Sécurité** : bcrypt pour le hachage des mots de passe et express-session pour les sessions.

Le projet suit une organisation proche du modèle **MVC** :

- les **routes** définissent les points d’entrée HTTP ;
- les **controllers** contiennent la logique applicative ;
- les **models** exécutent les requêtes SQL ;
- les fichiers du dossier **public** constituent l’interface utilisateur.

## 2. Objectifs fonctionnels

L’application permet :

- l’inscription, la connexion et la déconnexion des utilisateurs ;
- la gestion du profil personnel ;
- la publication de textes et d’images ;
- la modification et la suppression de publications ;
- les likes, commentaires et partages ;
- les demandes d’amis, acceptations, refus et suppressions ;
- la messagerie privée en temps réel ;
- les notifications pour les messages, likes, commentaires et demandes d’amis ;
- la recherche d’utilisateurs et de publications ;
- l’administration des utilisateurs, contenus et statistiques.

## 3. Architecture générale

La structure principale du projet est la suivante :

```text
social-network/
├── app.js
├── package.json
├── config/
├── controllers/
├── docs/
├── middleware/
├── models/
├── public/
├── routes/
├── scripts/
├── sockets/
└── views/
```

Cette architecture favorise la maintenabilité. Chaque dossier possède une responsabilité précise, ce qui limite le mélange entre l’interface, la logique métier et l’accès aux données.

## 4. Fonctionnement global de l’application

Lorsqu’un utilisateur accède à l’application, le serveur Express sert le fichier `public/index.html`. Le navigateur charge ensuite les fichiers CSS et JavaScript situés dans `public/css` et `public/js`.

Le frontend communique avec le backend grâce à des requêtes `fetch` vers les routes `/api/...`. Par exemple, l’inscription utilise `/api/auth/register`, le fil d’actualité utilise `/api/posts/timeline`, et la messagerie utilise `/api/messages/conversation/:friendId`.

Les actions en temps réel passent par Socket.IO. Lorsqu’un utilisateur se connecte, son navigateur envoie son identifiant au serveur via l’événement `register_user`. Le serveur ajoute alors l’utilisateur dans une salle Socket.IO personnelle nommée `user_<id>`. Cette salle permet d’envoyer des messages et notifications uniquement à l’utilisateur concerné.

## 5. Base de données MySQL

La base de données s’appelle `social_network_db`. Elle contient les tables principales suivantes :

- `users` : utilisateurs de la plateforme ;
- `posts` : publications ;
- `comments` : commentaires ;
- `likes` : réactions de type “j’aime” ;
- `shares` : partages ;
- `friends` : relations d’amitié ;
- `messages` : messages privés ;
- `notifications` : notifications.

Le fichier principal à importer pour installer la base est :

```text
scripts/import_social_network.sql
```

Ce fichier crée la base, les tables, les contraintes, les index et deux comptes de démonstration :

- administrateur : `admin@example.com` / `Admin1234!`
- utilisateur : `user@example.com` / `Admin1234!`

Le fichier `scripts/schema.sql` contient également un schéma SQL simple, tandis que `config/db.js` initialise automatiquement la base au démarrage si MySQL est disponible.

## 6. Sécurité

Plusieurs mécanismes de sécurité sont utilisés :

- les mots de passe sont hachés avec **bcrypt** avant stockage ;
- les sessions sont gérées avec **express-session** ;
- les routes sensibles utilisent le middleware `isLoggedIn` ;
- les requêtes SQL utilisent `mysql2` avec des paramètres `?`, ce qui limite les injections SQL ;
- les fichiers envoyés par les utilisateurs sont gérés avec `multer` ;
- les contenus affichés côté client sont échappés dans les scripts JavaScript afin de réduire le risque d’injection HTML.

En production, il serait recommandé d’ajouter HTTPS, des cookies sécurisés, une protection CSRF et une validation plus stricte des fichiers uploadés.

## 7. Description détaillée des fichiers

### 7.1 Fichiers racine

#### `app.js`

Fichier principal de l’application. Il initialise Express, crée le serveur HTTP, configure Socket.IO, active les middlewares JSON, URL encoded, sessions et fichiers statiques. Il monte toutes les routes API :

- `/api/auth`
- `/api/posts`
- `/api/friends`
- `/api/messages`
- `/api/notifications`
- `/api/search`
- `/api/admin`

Il sert aussi l’interface principale et démarre le serveur sur le port défini par `PORT` ou `3000`.

#### `package.json`

Fichier de configuration Node.js. Il déclare les scripts :

- `npm start` : lance `node app.js` ;
- `npm run dev` : lance `nodemon app.js`.

Il contient les dépendances nécessaires : Express, MySQL2, bcrypt, multer, dotenv, express-session, Socket.IO et Nodemon.

#### `package-lock.json`

Fichier généré automatiquement par npm. Il verrouille les versions exactes des dépendances installées pour assurer la reproductibilité du projet.

#### `.gitignore`

Fichier indiquant les éléments à ignorer par Git, par exemple certains fichiers générés ou dépendances.

### 7.2 Dossier `config`

#### `config/db.js`

Ce fichier configure la connexion MySQL avec `mysql2`. Il lit les variables d’environnement :

- `DB_HOST`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`

Il crée automatiquement la base `social_network_db` si elle n’existe pas, crée les tables nécessaires et applique des migrations simples pour ajouter les colonnes manquantes sur une ancienne base.

### 7.3 Dossier `middleware`

#### `middleware/auth.js`

Ce fichier contient deux middlewares :

- `isLoggedIn` : vérifie que l’utilisateur est connecté avant d’autoriser l’accès à une route ;
- `isLoggedOut` : empêche un utilisateur déjà connecté d’accéder aux routes d’inscription ou de connexion.

Il protège les routes qui nécessitent une session active.

### 7.4 Dossier `models`

Les modèles sont responsables de l’accès à MySQL.

#### `models/userModel.js`

Gère les utilisateurs. Il contient les méthodes de création d’un utilisateur, recherche par email, recherche par identifiant, récupération avec mot de passe, mise à jour du profil et changement de mot de passe.

#### `models/postModel.js`

Gère les publications. Il permet de créer une publication, récupérer le fil d’actualité avec les informations de l’auteur, rechercher une publication par identifiant, modifier et supprimer une publication.

#### `models/interactionModel.js`

Gère les interactions sociales : likes, commentaires et partages. Il permet de vérifier si un utilisateur a déjà aimé une publication, ajouter ou supprimer un like, créer ou supprimer un commentaire et enregistrer un partage.

#### `models/friendModel.js`

Gère les relations d’amitié. Il permet d’envoyer une demande, vérifier une relation existante, accepter une demande, supprimer une relation, récupérer la liste d’amis et les demandes reçues.

#### `models/messageModel.js`

Gère les messages privés. Il enregistre les messages dans MySQL et récupère l’historique d’une conversation entre deux utilisateurs.

#### `models/notificationModel.js`

Gère les notifications. Il crée une notification, récupère les notifications d’un utilisateur, marque une notification comme lue et marque toutes les notifications comme lues.

#### `models/searchModel.js`

Gère la recherche. Il permet de rechercher des utilisateurs par nom ou email, et des publications par contenu textuel.

#### `models/adminModel.js`

Gère les fonctionnalités administrateur. Il récupère tous les utilisateurs, supprime un utilisateur, change un rôle, récupère toutes les publications, supprime une publication et calcule les statistiques générales.

### 7.5 Dossier `controllers`

Les contrôleurs font le lien entre les routes HTTP et les modèles.

#### `controllers/authController.js`

Gère l’inscription, la connexion, la déconnexion, la vérification de session, la récupération de l’utilisateur courant et la modification du profil. Il utilise bcrypt pour hacher et comparer les mots de passe.

#### `controllers/postController.js`

Gère la création, la récupération, la modification et la suppression des publications. Il vérifie que l’auteur d’une publication est bien l’utilisateur connecté avant d’autoriser certaines opérations.

#### `controllers/interactionController.js`

Gère les likes, commentaires et partages. Il crée également des notifications lorsqu’un utilisateur aime ou commente une publication appartenant à un autre utilisateur.

#### `controllers/friendController.js`

Gère l’envoi, l’acceptation, le refus et la suppression des demandes d’amis. Lorsqu’une demande est envoyée, une notification est créée et transmise en temps réel.

#### `controllers/messageController.js`

Gère les routes HTTP liées aux messages. Il récupère une conversation et permet l’envoi d’un message via requête HTTP.

#### `controllers/notificationController.js`

Gère la consultation et la lecture des notifications.

#### `controllers/searchController.js`

Gère les recherches d’utilisateurs et de publications.

#### `controllers/adminController.js`

Gère les fonctionnalités administrateur : consultation des utilisateurs, suppression de comptes, suppression de publications, changement de rôle et statistiques.

### 7.6 Dossier `routes`

Les routes définissent les endpoints accessibles.

#### `routes/authRoutes.js`

Définit les routes d’authentification :

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/check`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

Il configure également `multer` pour les photos de profil.

#### `routes/postRoutes.js`

Définit les routes des publications et interactions :

- création de publication ;
- récupération du fil ;
- suppression et modification ;
- likes ;
- commentaires ;
- partages.

#### `routes/friendRoutes.js`

Définit les routes liées aux amis :

- envoyer une demande ;
- accepter une demande ;
- refuser ou supprimer une relation ;
- charger le tableau de bord des amis.

#### `routes/messageRoutes.js`

Définit les routes de messagerie privée :

- récupérer une conversation ;
- envoyer un message.

#### `routes/notificationRoutes.js`

Définit les routes de notifications :

- récupérer les notifications ;
- marquer une notification comme lue ;
- marquer toutes les notifications comme lues.

#### `routes/searchRoutes.js`

Définit les routes de recherche :

- utilisateurs ;
- publications.

#### `routes/adminRoutes.js`

Définit les routes réservées à l’administration :

- liste des utilisateurs ;
- changement de rôle ;
- suppression d’utilisateur ;
- liste et suppression des publications ;
- statistiques.

#### `routes/viewRoutes.js`

Redirige les anciennes routes de vues vers l’application principale `public/index.html`. Cela permet à l’application monopage de rester accessible par plusieurs URLs.

### 7.7 Dossier `sockets`

#### `sockets/messageSocket.js`

Fichier responsable du temps réel. Il initialise Socket.IO et gère :

- l’enregistrement d’un utilisateur connecté ;
- la diffusion de la liste des utilisateurs en ligne ;
- l’envoi et la réception de messages privés ;
- l’émission de notifications temps réel ;
- le retrait d’un utilisateur de la liste active lors de la déconnexion.

### 7.8 Dossier `public`

Ce dossier contient tous les fichiers accessibles par le navigateur.

#### `public/index.html`

Page principale de l’application. Elle contient :

- l’interface d’authentification ;
- la barre de navigation ;
- la sidebar gauche ;
- le fil d’actualité ;
- la sidebar droite avec notifications, tendances et utilisateurs en ligne ;
- la navigation mobile ;
- les modales profil, recherche, paramètres et administration ;
- la zone de chat privé.

#### `public/css/style.css`

Feuille de style principale. Elle définit :

- la palette claire et sombre ;
- les variables CSS ;
- le design glassmorphism ;
- les boutons, inputs, cartes, modales, sidebars et navigation ;
- les animations, skeleton loaders et transitions ;
- les media queries pour mobile, tablette et desktop.

#### `public/js/auth.js`

Script principal côté client. Il gère :

- inscription et connexion ;
- vérification de session ;
- affichage ou masquage de l’application ;
- création de publications ;
- affichage du fil d’actualité ;
- likes, commentaires, partages ;
- demandes d’amis ;
- notifications ;
- profil ;
- thème clair/sombre ;
- navigation mobile et paramètres.

#### `public/js/chat.js`

Script de messagerie. Il se connecte à Socket.IO, récupère l’utilisateur courant, affiche les utilisateurs en ligne, ouvre une conversation, charge l’historique et envoie les messages en temps réel.

#### `public/js/search-admin.js`

Script de recherche et d’administration. Il gère :

- la modale de recherche ;
- la recherche d’utilisateurs et publications ;
- les onglets administrateur ;
- les statistiques ;
- la gestion des utilisateurs ;
- la modération des publications.

#### `public/images/default-avatar.svg`

Image par défaut utilisée lorsqu’un utilisateur n’a pas encore choisi de photo de profil.

#### `public/uploads/`

Dossier de stockage des images uploadées : avatars et images de publications. Les fichiers présents dans ce dossier sont servis statiquement par Express.

### 7.9 Dossier `scripts`

#### `scripts/import_social_network.sql`

Fichier SQL complet destiné aux camarades. Il permet d’importer la base dans MySQL avec les tables, contraintes, index et comptes de démonstration.

#### `scripts/schema.sql`

Schéma SQL simple contenant uniquement la création de la base et des tables.

#### `scripts/create_admin.js`

Script Node.js qui crée un compte administrateur de démonstration si celui-ci n’existe pas déjà.

#### `scripts/transfer_admin.js`

Script destiné à transférer ou attribuer le rôle administrateur à un utilisateur existant selon la logique prévue dans le fichier.

#### `scripts/test_realtime.js`

Script utilisé pour tester la communication temps réel Socket.IO.

### 7.10 Dossier `docs`

#### `docs/cahier_des_charges.md`

Document décrivant les objectifs, acteurs, contraintes techniques, règles métier et livrables du projet.

#### `docs/dictionnaire_donnees.md`

Document décrivant les tables, champs, types et contraintes de la base de données.

#### `docs/manuel_utilisateur.md`

Guide destiné à l’utilisateur final. Il explique comment utiliser les principales fonctionnalités de l’application.

#### `docs/rapport_complet.md`

Présent document. Il synthétise le fonctionnement global, l’architecture et le rôle des fichiers.

#### `docs/uml/diagramme_cas_utilisation.md`

Diagramme des cas d’utilisation présentant les interactions entre visiteur, utilisateur et administrateur.

#### `docs/uml/diagramme_classes.md`

Diagramme de classes décrivant les principales entités métier : utilisateur, publication, commentaire, like, relation, message et notification.

#### `docs/uml/diagramme_activite.md`

Diagramme d’activité décrivant le déroulement général de l’application, de la connexion aux interactions sociales.

#### `docs/uml/diagrammes_sequence.md`

Diagrammes de séquence décrivant certains scénarios, par exemple l’authentification, la publication ou la messagerie.

### 7.11 Dossier `views`

Le dossier `views` contient d’anciennes pages HTML séparées :

- `views/auth/login.html`
- `views/auth/register.html`
- `views/posts/timeline.html`
- `views/users/profile.html`
- `views/admin/dashboard.html`

Dans la version actuelle, l’application principale est centralisée dans `public/index.html`. Les routes de vues redirigent donc vers cette interface unique.

### 7.12 Fichiers de logs

#### `server-ui.log` et `server-ui.err.log`

Fichiers de logs générés pendant les tests de lancement du serveur. Ils ne sont pas essentiels au fonctionnement applicatif et peuvent être supprimés ou ignorés dans une version finale.

## 8. Flux fonctionnels importants

### 8.1 Inscription

L’utilisateur saisit son nom, email, mot de passe et éventuellement une photo. Le frontend envoie un `FormData` à `/api/auth/register`. Le backend vérifie les champs, cherche si l’email existe déjà, hache le mot de passe avec bcrypt, stocke l’utilisateur puis retourne un message de succès.

### 8.2 Connexion

L’utilisateur saisit email et mot de passe. Le backend récupère l’utilisateur, compare le mot de passe avec bcrypt, puis crée une session contenant l’identifiant, le nom et le rôle.

### 8.3 Publication

L’utilisateur écrit un texte ou choisit une image. Le formulaire est envoyé à `/api/posts/create`. Le backend stocke la publication dans `posts`. Le fil est ensuite rechargé côté client.

### 8.4 Like et commentaire

Lorsqu’un utilisateur aime ou commente une publication, le backend met à jour les tables `likes` ou `comments`. Si l’auteur de la publication est différent, une notification est créée et envoyée via Socket.IO.

### 8.5 Demande d’ami

Une demande d’ami est enregistrée dans la table `friends` avec le statut `pending`. Le destinataire reçoit une notification. Il peut ensuite accepter ou refuser la demande.

### 8.6 Messagerie instantanée

Lorsqu’un message est envoyé, Socket.IO transmet l’événement au serveur. Le message est enregistré en base puis envoyé à la salle privée du destinataire. Une notification de message est également créée.

### 8.7 Administration

L’administrateur peut consulter les statistiques, gérer les utilisateurs et supprimer les publications inappropriées. Le premier utilisateur inscrit devient automatiquement administrateur, et un compte admin peut aussi être créé par SQL ou par script.

## 9. Installation et lancement

### 9.1 Importer la base

Importer le fichier :

```text
scripts/import_social_network.sql
```

Méthode en ligne de commande :

```bash
mysql -u root -p < scripts/import_social_network.sql
```

### 9.2 Configurer `.env`

Exemple :

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=social_network_db
SESSION_SECRET=change_this_secret
```

### 9.3 Installer et lancer

```bash
npm install
npm start
```

Sous Windows PowerShell, si `npm` est bloqué par la politique d’exécution :

```powershell
npm.cmd start
```

L’application est ensuite disponible sur :

```text
http://localhost:3000
```

## 10. Conclusion

Le projet Social Network démontre la conception d’une application web dynamique complète avec Node.js, Express, MySQL et Socket.IO. Il couvre les fonctionnalités essentielles d’un réseau social moderne : authentification, publications, interactions, relations, messagerie, notifications, recherche et administration.

L’architecture MVC, l’utilisation de requêtes SQL paramétrées, la gestion des sessions, le hachage des mots de passe et le temps réel constituent les éléments techniques majeurs du projet. L’interface responsive et le mode sombre améliorent l’expérience utilisateur et rendent l’application adaptée aux usages modernes.
