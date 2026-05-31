# UML — Diagramme de classes (niveau MVC)

## Vue (HTML)
- `views/auth/login.html`
- `views/auth/register.html`
- `views/posts/timeline.html`
- `views/users/profile.html`
- `views/admin/dashboard.html`

## Contrôleurs (Express)
- `controllers/authController.js`
  - `register(req,res)`
  - `login(req,res)`
  - `logout(req,res)`
  - `checkAuth(req,res)`
  - `getCurrentUser(req,res)`
  - `updateProfile(req,res)`

- `controllers/postController.js`
  - `createPost(req,res)`
  - `getTimeline(req,res)`
  - `updatePost(req,res)`
  - `deletePost(req,res)`

- `controllers/interactionController.js`
  - `toggleLike(req,res)`
  - `commentPost(req,res)`
  - `getComments(req,res)`
  - `deleteComment(req,res)`
  - `sharePost(req,res)`

- `controllers/friendController.js` (non listé ici mais utilisé via routes)

- `controllers/messageController.js`
  - `getConversation(req,res)`
  - `sendMessage(req,res)`

- `controllers/notificationController.js`
  - `getNotifications(req,res)`
  - `markRead(req,res)`
  - `markAllRead(req,res)`

- `controllers/searchController.js` (si utilisé)
- `controllers/adminController.js` (si utilisé)

## Modèles (Data access MySQL)
- `models/userModel.js`
- `models/postModel.js`
- `models/interactionModel.js`
- `models/messageModel.js`
- `models/notificationModel.js`

## Socket.IO
- `sockets/messageSocket.js`
  - `initSocket(io)`
  - `notifyUser(userId, notification)`

## Relations principales
- Express Router → Controller → Model (DB)
- Controller → Socket (notifications realtime)
- Socket → Emissions au client : `receive_private_message`, `new_notification`, `update_online_users`

