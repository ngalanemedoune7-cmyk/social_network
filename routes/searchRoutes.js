const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { isLoggedIn } = require('../middleware/auth');

router.get('/users', isLoggedIn, searchController.searchUsers);
router.get('/posts', isLoggedIn, searchController.searchPosts);

module.exports = router;
