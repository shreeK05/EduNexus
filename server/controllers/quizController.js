const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');

// @desc    Create a new Quiz
const createQuiz = async (req, res) => {
  try {
    // Extract BOTH dates
    const { classId, title, questions, startDate, dueDate } = req.body; 

    const newQuiz = new Quiz({
      classId,
      title,
      questions,
      startDate, // <--- Save Start
      dueDate    // <--- Save End
    });

    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Quizzes
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ classId: req.params.classId });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Quiz
const getSingleQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit Quiz
const submitQuiz = async (req, res) => {
  try {
    const { quizId, studentId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    quiz.questions.forEach((q, index) => {
      const studentAnswer = answers[index];
      if (q.type === 'single') {
        if (studentAnswer && studentAnswer[0] === q.correct) score++;
      }
    });

    const result = new QuizResult({
      quizId,
      studentId,
      score,
      totalQuestions: quiz.questions.length,
      answers
    });

    await result.save();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createQuiz, getQuizzes, getSingleQuiz, submitQuiz };