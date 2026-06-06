# Diagramme de cas d'utilisation

```mermaid
usecaseDiagram
actor Visiteur
actor Utilisateur
actor Administrateur

Visiteur --> (S'inscrire)
Visiteur --> (Se connecter)

Utilisateur --> (Gérer son profil)
Utilisateur --> (Créer une publication)
Utilisateur --> (Modifier une publication)
Utilisateur --> (Supprimer sa publication)
Utilisateur --> (Aimer une publication)
Utilisateur --> (Commenter une publication)
Utilisateur --> (Partager une publication)
Utilisateur --> (Envoyer une demande d'ami)
Utilisateur --> (Accepter ou refuser une demande)
Utilisateur --> (Envoyer un message privé)
Utilisateur --> (Recevoir des notifications)
Utilisateur --> (Rechercher utilisateurs et publications)

Administrateur --> (Consulter les statistiques)
Administrateur --> (Gérer les utilisateurs)
Administrateur --> (Supprimer un contenu)

Administrateur --|> Utilisateur
```
