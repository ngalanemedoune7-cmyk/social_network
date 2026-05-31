# UML — Diagrammes de séquence (résumé)

## Inscription
1. Client → POST `/api/auth/register`
2. `authController.register` valide + hache mot de passe
3. `userModel.create` insère en DB
4. Réponse success → redirection/affichage côté client

## Connexion
1. Client → POST `/api/auth/login`
2. `authController.login` vérifie bcrypt
3. `req.session.userId` + `req.session.fullname`
4. Client reçoit user et est redirigé vers `/posts/timeline`

## Timeline / Publication
1. Client → GET `/api/posts/timeline`
2. `postController.getTimeline` récupère posts
3. `interactionController` gère like/comment/share via endpoints REST

## Notification realtime
1. Action like/comment côté backend
2. `notificationModel.create` enregistre DB
3. `sockets/messageSocket.notifyUser` émet `new_notification` au room `user_<id>`
4. Client reçoit `new_notification` et met à jour l’UI

## Chat realtime
1. Client → Socket emit `send_private_message`
2. `sockets/messageSocket` insère message DB
3. `notificationModel.create` (type message)
4. Socket émet `receive_private_message` au room du receiver

