# Social Network

Application web de réseau social dynamique réalisée avec JavaScript Vanilla, Node.js, Express, MySQL, Socket.IO, bcrypt et express-session.

## Fonctionnalités

- Inscription, connexion, déconnexion et sessions.
- Profil utilisateur avec photo et modification du mot de passe.
- Publications texte/image, modification, suppression et fil d'actualité.
- Likes, commentaires, suppression de commentaires et partages.
- Demandes d'amis, acceptation, refus et retrait.
- Chat privé en temps réel avec Socket.IO.
- Notifications temps réel pour messages, likes, commentaires et demandes d'amis.
- Recherche d'utilisateurs et de publications.
- Administration: statistiques, gestion des utilisateurs et modération des publications.

## Installation

1. Installer MySQL et créer un utilisateur ayant le droit de créer une base.
2. Copier les variables dans un fichier `.env` si nécessaire:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=social_network_db
SESSION_SECRET=change_this_secret
```

3. Installer les dépendances:

```bash
npm install
```

4. Lancer l'application:

```bash
npm start
```

La base et les tables sont créées automatiquement au démarrage. Pour partager le projet avec vos camarades, utilisez le fichier d'import complet `scripts/import_social_network.sql`. Le script SQL simple reste disponible dans `scripts/schema.sql`.

## Compte administrateur

Le premier utilisateur inscrit devient automatiquement administrateur. Un compte admin de test peut aussi être créé avec:

```bash
node scripts/create_admin.js
```

Identifiants par défaut du script: `admin@example.com` / `Admin1234!`.

## Structure

- `app.js`: configuration Express, sessions, routes et Socket.IO.
- `config/db.js`: connexion MySQL et initialisation du schéma.
- `controllers/`: logique applicative MVC.
- `models/`: requêtes SQL paramétrées.
- `routes/`: endpoints API.
- `middleware/`: protection des routes.
- `public/`: frontend HTML/CSS/JavaScript Vanilla et uploads.
- `sockets/`: événements temps réel.
- `docs/`: cahier des charges, dictionnaire, manuel et UML.

## Livrables importants

- `scripts/import_social_network.sql`: fichier SQL complet à importer dans MySQL.
- `docs/rapport_complet.md`: rapport académique complet du projet.
- `docs/dictionnaire_donnees.md`: dictionnaire des tables et champs.
- `docs/uml/`: diagrammes UML.
