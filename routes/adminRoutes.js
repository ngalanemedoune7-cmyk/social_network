const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isLoggedIn } = require('../middleware/auth');

router.get('/users', isLoggedIn, adminController.getAllUsers);
router.put('/users/:userId/role', isLoggedIn, adminController.updateUserRole);
router.delete('/users/:userId', isLoggedIn, adminController.deleteUser);
router.delete('/posts/:postId', isLoggedIn, adminController.deletePost);
router.get('/statistics', isLoggedIn, adminController.getStatistics);

module.exports = router;
