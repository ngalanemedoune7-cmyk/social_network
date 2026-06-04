const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


router.post('/register', authMiddleware.isLoggedOut, upload.single('profile_picture'), authController.register);
router.post('/login', authMiddleware.isLoggedOut, authController.login);
router.post('/logout', authMiddleware.isLoggedIn, authController.logout);
router.get('/check', authController.checkAuth);
router.get('/me', authController.getCurrentUser);
router.put('/profile', authMiddleware.isLoggedIn, upload.single('profile_picture'), authController.updateProfile);

module.exports = router;