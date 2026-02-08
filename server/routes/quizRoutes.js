const express = require('express');
const router = express.Router();
const { 
  createQuiz, 
  getQuizzes, 
  getSingleQuiz, 
  submitQuiz 
} = require('../controllers/quizController');

// Check if functions are loaded (Debug log)
if (!createQuiz || !getQuizzes || !getSingleQuiz || !submitQuiz) {
    console.error("❌ Error: One or more Quiz Controller functions are undefined. Check quizController.js exports.");
}

router.post('/create', createQuiz);
router.get('/:classId', getQuizzes);     // <--- This was likely line 15 causing the error
router.get('/single/:id', getSingleQuiz);
router.post('/submit', submitQuiz);

module.exports = router;