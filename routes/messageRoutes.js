const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { isLoggedIn } = require('../middleware/auth');

router.get('/conversation/:friendId', isLoggedIn, messageController.getConversation);
router.get('/messages/:receiverId', isLoggedIn, messageController.getConversation);
router.post('/send', isLoggedIn, messageController.sendMessage);

module.exports = router;
