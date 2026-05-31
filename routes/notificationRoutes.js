const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { isLoggedIn } = require('../middleware/auth');

router.get('/', isLoggedIn, notificationController.getNotifications);
router.put('/read/:id', isLoggedIn, notificationController.markRead);
router.put('/read-all', isLoggedIn, notificationController.markAllRead);

module.exports = router;
