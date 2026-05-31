# Manuel utilisateur — Social Network

## 1) Prérequis
- Avoir Node.js installé
- Avoir MySQL configuré (script `CREATE DATABASE ...` fourni dans le dépôt)

## 2) Démarrage du serveur
1. Lancer la commande de démarrage (selon ton `package.json`).
2. Ouvrir : `http://localhost:3000`

## 3) Inscription
- Accéder à : `/auth/register`
- Remplir : nom complet, email, mot de passe (et photo optionnelle)
- Soumettre le formulaire

## 4) Connexion
- Accéder à : `/auth/login`
- Saisir email et mot de passe
- Une fois connecté, l’utilisateur est redirigé vers le fil d’actualité

## 5) Fil d’actualité (posts)
- Publier un texte et/ou une image
- Les posts affichent compteur likes/commentaires

## 6) Interactions
- Like d’un post
- Commentaire sur un post
- Suppression de ses propres commentaires
- Partage d’un post

## 7) Amis
- Consulter le dashboard amis (demandes reçues + liste)
- Accepter / refuser / supprimer un ami

## 8) Messagerie instantanée (Socket.IO)
- Depuis la liste d’amis en ligne, ouvrir le chat privé
- Envoyer des messages en temps réel

## 9) Notifications (temps réel)
- Les notifications s’affichent dans le panneau dédié
- Marquer tout comme lu via “Tout marquer lu”

## 10) Profil
- Mettre à jour : nom, email, photo
- Mettre à jour le mot de passe (si supporté par ton backend)

## 11) Administration
- Accéder au panneau admin
- Consulter/mettre à jour les éléments selon les routes d’admin

## 12) Sécurité
- Mots de passe hashés avec bcrypt
- Session via express-session
- Paramètres SQL via requêtes préparées (db.execute)

