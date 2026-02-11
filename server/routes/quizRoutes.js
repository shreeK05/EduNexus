const express = require('express');
const router = express.Router();

// 1. Import Middleware
const { protect } = require('../middleware/auth'); 

// 2. Import Controller
const { 
    createQuiz, 
    getQuizzesByClass, 
    getQuizById, 
    submitQuiz,
    updateQuiz, 
    deleteQuiz  
} = require('../controllers/quizController');

// 🔍 DEBUGGING BLOCK (This will show up in your Render Logs)
console.log("--- DEBUGGING ROUTE IMPORTS ---");
console.log("Protect Middleware:", protect ? "✅ Loaded" : "❌ MISSING (Undefined)");
console.log("CreateQuiz:", createQuiz ? "✅ Loaded" : "❌ MISSING (Undefined)");
console.log("GetQuizzes:", getQuizzesByClass ? "✅ Loaded" : "❌ MISSING (Undefined)");
console.log("-------------------------------");

// 🛡️ STOP SERVER IF MISSING (Prevents the crash loop)
if (!protect || !createQuiz) {
    throw new Error("CRITICAL: Missing required imports in quizRoutes.js. Check logs above.");
}

// Routes
router.post('/create', protect, createQuiz);
router.get('/class/:classId', protect, getQuizzesByClass);
router.get('/:id', protect, getQuizById);
router.post('/submit', protect, submitQuiz);

// Edit & Delete
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);

module.exports = router;