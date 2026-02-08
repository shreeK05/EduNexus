// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Import middleware to protect routes
const auth = require('../middleware/auth'); 

// Import controller functions (Make sure deleteAccount is added here)
const { registerUser, loginUser, deleteAccount } = require('../controllers/authController');

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private Route (Delete Account) - Protected by 'auth' middleware
router.delete('/delete', auth, deleteAccount);

module.exports = router;