const express = require('express');
const path = require('path');

const router = express.Router();
const indexPath = path.join(__dirname, '..', 'public', 'index.html');

router.get(['/auth/login', '/auth/register', '/posts/timeline', '/users/profile', '/admin/dashboard'], (req, res) => {
    res.sendFile(indexPath);
});

module.exports = router;
