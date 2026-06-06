# Cahier des charges

## Objectif

Développer une plateforme web de réseau social permettant la création de comptes, la publication de contenus, les interactions sociales, la messagerie privée, les notifications temps réel, la recherche et l'administration.

## Acteurs

- Visiteur: peut s'inscrire et se connecter.
- Utilisateur: gère son profil, publie, commente, aime, partage, cherche et discute.
- Administrateur: consulte les statistiques, gère les utilisateurs et supprime les contenus inappropriés.

## Contraintes techniques

- Frontend en HTML5, CSS3 et JavaScript Vanilla.
- Backend Node.js et Express.js.
- Base de données relationnelle MySQL.
- Temps réel avec Socket.IO.
- Mots de passe sécurisés avec bcrypt.
- Sessions avec express-session.
- Architecture MVC: routes, controllers, models.
- Requêtes SQL paramétrées via mysql2 pour limiter les injections SQL.
- Interface responsive en CSS pur.

## Règles métier

- Le premier utilisateur inscrit devient administrateur.
- Une publication doit contenir du texte ou une image.
- Un utilisateur ne peut aimer ou partager une même publication qu'une seule fois.
- Les commentaires ne peuvent être supprimés que par leur auteur.
- Les publications ne peuvent être modifiées ou supprimées que par leur auteur, sauf suppression par administrateur.
- Une demande d'ami ne peut pas être envoyée à soi-même.
- Les notifications sont créées pour les likes, commentaires, messages et demandes d'amis.

## Livrables

- Application fonctionnelle.
- Schéma MySQL dans `scripts/schema.sql`.
- Documentation utilisateur.
- Dictionnaire de données.
- Diagrammes UML.
- README d'installation et de démonstration.
