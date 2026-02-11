const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserProfile 
} = require('../controllers/authController');

// ✅ CORRECT IMPORT: Must point to '../middleware/auth' (NOT authMiddleware)
const { protect } = require('../middleware/auth'); 

// Debugging check (Logs to Render console if something is missing)
if (!protect) {
    console.error("❌ CRITICAL ERROR: 'protect' is undefined in authRoutes.js. Check middleware/auth.js export.");
}

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// If you have a delete route causing the crash, ensure the controller exists
// router.delete('/:id', protect, deleteUser); <--- Only keep this if you created a deleteUser controller

module.exports = router;