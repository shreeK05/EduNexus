const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Classroom = require('../models/Classroom');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a new Quiz & Notify Students
const createQuiz = async (req, res) => {
  try {
    const { classId, title, questions, startDate, dueDate } = req.body; 

    const newQuiz = new Quiz({
      classId,
      title,
      questions,
      startDate, 
      dueDate    
    });

    const savedQuiz = await newQuiz.save();

    // --- EMAIL NOTIFICATION ---
    const classroom = await Classroom.findById(classId).populate('students', 'email name');

    if (classroom && classroom.students.length > 0) {
        console.log(`Sending quiz emails to ${classroom.students.length} students...`);
        
        const formatTime = (dateString) => {
            return new Date(dateString).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        };

        classroom.students.forEach(student => {
            sendEmail({
                email: student.email,
                subject: `🧠 New Quiz Scheduled: ${title}`,
                message: `
                  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #9333ea;">New Quiz Scheduled 🧠</h2>
                    <p><strong>Class:</strong> ${classroom.name}</p>
                    <p><strong>Quiz:</strong> ${title}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                    <p><strong>📅 Start Time:</strong> ${formatTime(startDate)}</p>
                    <p><strong>⏳ Due Time:</strong> ${formatTime(dueDate)}</p>
                    <div style="margin-top: 20px;">
                        <a href="https://edu-nexus-teal.vercel.app/class/${classId}" style="background-color: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Quiz</a>
                    </div>
                  </div>
                `
            })
            .then(() => console.log(`✅ Email sent to ${student.email}`))
            .catch(err => console.log(`❌ FAILED for ${student.email}: ${err.message}`));
        });
    }

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

    const now = new Date();
    const start = new Date(quiz.startDate);

    // If Current Time is BEFORE Start Time -> Block Access
    if (now < start) {
        return res.status(403).json({ message: `Quiz starts at ${start.toLocaleString()}` });
    }

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

    // Calculate Score (Simple check)
    let score = 0;
    quiz.questions.forEach((q, index) => {
      const studentAnswer = answers[index]; 
      // Assuming q.correct is the index (0, 1, 2, 3)
      if (studentAnswer !== undefined && parseInt(studentAnswer) === q.correct) {
           score++;
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

// @desc    Update a Quiz
const updateQuiz = async (req, res) => {
  try {
    const { title, questions, duration, startDate } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    quiz.title = title || quiz.title;
    quiz.questions = questions || quiz.questions;
    quiz.duration = duration || quiz.duration;
    quiz.startDate = startDate || quiz.startDate;

    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a Quiz
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    await quiz.deleteOne(); 
    res.json({ message: "Quiz removed" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UNIFIED EXPORT (Fixes the mixing issue)
module.exports = { 
    createQuiz, 
    getQuizzes, 
    getSingleQuiz, 
    submitQuiz, 
    updateQuiz, 
    deleteQuiz 
};