const express = require('express');
const router = express.Router();
const { 
    loginWithProjectCode, 
    verifyToken, 
    getCurrentUser, 
    logout 
} = require('../controllers/authController');
const { rateLimit } = require('../middleware/validation');

// Enhanced login endpoint
router.post('/login', rateLimit(10, 15 * 60 * 1000), loginWithProjectCode);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.post('/logout', verifyToken, logout);

module.exports = router;
