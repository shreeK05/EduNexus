const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    createQuiz, 
    getQuizzesByClass, 
    getQuizById, 
    submitQuiz,
    updateQuiz, // <--- Import this
    deleteQuiz  // <--- Import this
} = require('../controllers/quizController');

router.post('/create', protect, createQuiz);
router.get('/class/:classId', protect, getQuizzesByClass);
router.get('/:id', protect, getQuizById);
router.post('/:id/submit', protect, submitQuiz);

// ✅ NEW ROUTES FOR EDIT & DELETE
router.put('/:id', protect, updateQuiz);
router.delete('/:id', protect, deleteQuiz);

module.exports = router;