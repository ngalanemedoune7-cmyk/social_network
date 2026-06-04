const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postController = require('../controllers/postController');
const interactionController = require('../controllers/interactionController');
const { isLoggedIn } = require('../middleware/auth');


const storage = multer.diskStorage({
    destination: (req, file, cb) => { 
        cb(null, 'public/uploads/'); 
    },
    filename: (req, file, cb) => { 
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });


router.post('/create', isLoggedIn, upload.single('image'), postController.createPost);
router.get('/timeline', isLoggedIn, postController.getTimeline);
router.delete('/:id', isLoggedIn, postController.deletePost);
router.put('/:id', isLoggedIn, postController.updatePost);



router.post('/like/:postId', isLoggedIn, interactionController.toggleLike);
router.post('/comment/:postId', isLoggedIn, interactionController.commentPost);
router.get('/comments/:postId', isLoggedIn, interactionController.getComments);
router.delete('/comment/:commentId', isLoggedIn, interactionController.deleteComment);
router.post('/share/:postId', isLoggedIn, interactionController.sharePost);

module.exports = router;