const express = require('express');
const router = express.Router();

// ✅ CORRECT IMPORT: Pointing to 'auth.js' inside the 'middleware' folder
const { protect } = require('../middleware/auth'); 

const { 
    createQuiz, 
    getQuizzesByClass, 
    getQuizById, 
    submitQuiz,
    updateQuiz, 
    deleteQuiz  
} = require('../controllers/quizController');

// Routes
router.post('/create', protect, createQuiz);
router.get('/class/:classId', protect, getQuizzesByClass); // Matches controller
router.get('/:id', protect, getQuizById); // Matches controller
router.post('/submit', protect, submitQuiz);

// Edit & Delete Routes
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);

module.exports = router;