const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserProfile 
} = require('../controllers/authController');

const { protect } = require('../middleware/auth'); 

// Debugging check
if (!getUserProfile) {
    console.error("❌ ERROR: getUserProfile is undefined. Check authController.js");
}

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile); // This is Line 19 (The one that crashed)

module.exports = router;