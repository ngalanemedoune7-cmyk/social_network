const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/auth/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'auth', 'login.html'));
});

router.get('/auth/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'auth', 'register.html'));
});

router.get('/posts/timeline', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'posts', 'timeline.html'));
});

router.get('/users/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'users', 'profile.html'));
});

router.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'admin', 'dashboard.html'));
});

module.exports = router;

