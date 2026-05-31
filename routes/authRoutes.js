const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Configuration du stockage des photos de profil
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Stockage dans le même dossier d'uploads
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Route d'inscription modifiée pour accepter un fichier nommé "profile_picture"
router.post('/register', authMiddleware.isLoggedOut, upload.single('profile_picture'), authController.register);
router.post('/login', authMiddleware.isLoggedOut, authController.login);
router.post('/logout', authMiddleware.isLoggedIn, authController.logout);
router.get('/check', authController.checkAuth);
router.get('/me', authController.getCurrentUser);
router.put('/profile', authMiddleware.isLoggedIn, upload.single('profile_picture'), authController.updateProfile);

module.exports = router;