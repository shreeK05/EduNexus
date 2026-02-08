const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');

// @desc    Create a new Quiz
const createQuiz = async (req, res) => {
  try {
    // Extract fields including dates
    const { classId, title, questions, startDate, dueDate } = req.body; 

    const newQuiz = new Quiz({
      classId,
      title,
      questions,
      startDate, 
      dueDate    
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

// @desc    Get Single Quiz (With Start Time Check)
const getSingleQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // --- TIME VALIDATION START ---
    const now = new Date();
    const start = new Date(quiz.startDate);

    // If Current Time is BEFORE Start Time -> Block Access
    if (now < start) {
        return res.status(403).json({ message: `Quiz starts at ${start.toLocaleString()}` });
    }
    // --- TIME VALIDATION END ---

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit Quiz (With Due Date Check)
const submitQuiz = async (req, res) => {
  try {
    const { quizId, studentId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // --- TIME VALIDATION START ---
    const now = new Date();
    const due = new Date(quiz.dueDate);
    const gracePeriod = 2 * 60 * 1000; // 2 Minutes Grace Period for lag

    // If Current Time is AFTER Due Date + Grace Period -> Block Submission
    if (now > (due.getTime() + gracePeriod)) {
        return res.status(400).json({ message: "Submission Failed: Time is up!" });
    }
    // --- TIME VALIDATION END ---

    // Calculate Score
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