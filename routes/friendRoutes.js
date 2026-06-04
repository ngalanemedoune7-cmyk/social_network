const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { isLoggedIn } = require('../middleware/auth');


router.post('/request/:userId', isLoggedIn, friendController.sendFriendRequest);
router.put('/accept/:userId', isLoggedIn, friendController.acceptFriendRequest);
router.delete('/reject/:userId', isLoggedIn, friendController.removeFriend);
router.get('/dashboard', isLoggedIn, friendController.getFriendsDashboard);

module.exports = router;