const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postController = require('../controllers/postController');
const interactionController = require('../controllers/interactionController');
const { isLoggedIn } = require('../middleware/auth');

// Configuration de Multer pour les images des posts
const storage = multer.diskStorage({
    destination: (req, file, cb) => { 
        cb(null, 'public/uploads/'); 
    },
    filename: (req, file, cb) => { 
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// --- Routes Publications ---
router.post('/create', isLoggedIn, upload.single('image'), postController.createPost);
router.get('/timeline', isLoggedIn, postController.getTimeline);
router.delete('/:id', isLoggedIn, postController.deletePost);
router.put('/:id', isLoggedIn, postController.updatePost);

// --- Routes Interactions (Likes, Commentaires, Partages) ---
// Note: Assure-toi que ces routes correspondent aux exports dans interactionController.js
router.post('/like/:postId', isLoggedIn, interactionController.toggleLike);
router.post('/comment/:postId', isLoggedIn, interactionController.commentPost);
router.get('/comments/:postId', isLoggedIn, interactionController.getComments);
router.delete('/comment/:commentId', isLoggedIn, interactionController.deleteComment);
router.post('/share/:postId', isLoggedIn, interactionController.sharePost);

module.exports = router;