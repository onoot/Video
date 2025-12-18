// routes/auth.routes.js
const express = require('express');
const { login, logout, checkAuth, change_password,change_login } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', login);
router.post('/change_password', change_password);
router.post('/change_login', change_login);
router.post('/logout', logout);
router.get('/check', checkAuth);

module.exports = router;