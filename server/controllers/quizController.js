const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Classroom = require('../models/Classroom'); // Import Classroom for emails
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
        
        // Helper to format time in India Standard Time (IST)
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
                    <p>Make sure to submit before the deadline!</p>
                    <div style="margin-top: 20px;">
                        <a href="https://edu-nexus-teal.vercel.app/class/${classId}" style="background-color: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Quiz</a>
                    </div>
                  </div>
                `
            })
            .then(() => console.log(`✅ Email sent to ${student.email}`))
            .catch(err => {
                console.log(`❌ FAILED for ${student.email}`);
                console.log(`REASON: ${err.message}`);
            });
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
      // In the frontend, answers are arrays (for checkbox support), but simpler logic here:
      const studentAnswer = answers[index]; 
      
      // If student answer matches correct index
      // (assuming q.correct is the index number, e.g. 0, 1, 2, 3)
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

// ... existing code ...

// @desc    Update a Quiz
// @route   PUT /api/quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
    const { title, questions, duration, startDate } = req.body;
    
    // Find quiz and update it
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Update fields
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
// @route   DELETE /api/quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    await quiz.deleteOne(); // Deletes the quiz from MongoDB
    res.json({ message: "Quiz removed" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createQuiz, getQuizzes, getSingleQuiz, submitQuiz, updateQuiz, deleteQuiz };