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
    const classroom = await Classroom.findById(classId)
      .populate('students', 'email name')
      .populate('teacherId', 'name email');

    if (classroom && classroom.students.length > 0) {
      console.log(`Sending quiz emails to ${classroom.students.length} students...`);

      const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'full',
          timeStyle: 'short'
        });
      };

      classroom.students.forEach(student => {
        sendEmail({
          email: student.email,
          subject: `🧠 New Quiz Scheduled: ${title} - ${classroom.name}`,
          message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
                <h2 style="color: white; margin: 0; font-size: 24px;">🧠 New Quiz Scheduled</h2>
              </div>
              
              <p style="font-size: 16px; color: #333;">Hello <strong>${student.name}</strong>,</p>
              <p style="color: #666; line-height: 1.6;">Your teacher has scheduled a new quiz. Please review the details below:</p>
              
              <div style="background-color: #faf5ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea;">
                <p style="margin: 8px 0;"><strong style="color: #9333ea;">📚 Class:</strong> ${classroom.name} (${classroom.section})</p>
                <p style="margin: 8px 0;"><strong style="color: #9333ea;">📖 Subject:</strong> ${classroom.subject}</p>
                <p style="margin: 8px 0;"><strong style="color: #9333ea;">👨‍🏫 Teacher:</strong> ${classroom.teacherId?.name}</p>
                <p style="margin: 8px 0;"><strong style="color: #9333ea;">🧠 Quiz:</strong> ${title}</p>
                <p style="margin: 8px 0;"><strong style="color: #9333ea;">📝 Questions:</strong> ${questions.length} questions</p>
              </div>
              
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 8px 0; color: #92400e;"><strong>🕐 Start Time:</strong> ${formatTime(startDate)}</p>
                <p style="margin: 8px 0; color: #92400e;"><strong>⏳ Due Time:</strong> ${formatTime(dueDate)}</p>
              </div>
              
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #991b1b;"><strong>⚠️ Important:</strong> Make sure to complete the quiz before the due time. Late submissions will not be accepted.</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://edu-nexus-rho.vercel.app/class/${classId}" style="background-color: #9333ea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);">Go to Quiz</a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated notification from EduNexus. Please do not reply to this email.</p>
            </div>
          `
        }).catch(err => console.error(`Failed to notify ${student.email}:`, err.message));
      });
    }

    res.status(201).json(savedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Quizzes by Class ID
// ⚠️ RENAMED to match route import
const getQuizzesByClass = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ classId: req.params.classId });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Quiz by ID
// ⚠️ RENAMED to match route import
const getQuizById = async (req, res) => {
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

    // Calculate Score
    let score = 0;
    quiz.questions.forEach((q, index) => {
      let studentAnswer = answers[index] || [];
      let correctAnswer = q.correct || [];

      // Normalize to arrays if they aren't already (compatibility)
      if (!Array.isArray(studentAnswer)) studentAnswer = [studentAnswer];
      if (!Array.isArray(correctAnswer)) correctAnswer = [correctAnswer];

      // Convert all to integers for accurate comparison
      studentAnswer = studentAnswer.map(Number).sort((a, b) => a - b);
      correctAnswer = correctAnswer.map(Number).sort((a, b) => a - b);

      // Compare Arrays
      const isCorrect =
        studentAnswer.length === correctAnswer.length &&
        studentAnswer.every((val, i) => val === correctAnswer[i]);

      if (isCorrect) {
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
    const { title, questions, startDate, dueDate } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check if quiz has already started
    const now = new Date();
    const quizStartTime = new Date(quiz.startDate);

    if (now >= quizStartTime) {
      return res.status(403).json({ message: "Cannot edit quiz after it has started" });
    }

    // Check if timing changed (to send notification)
    const timingChanged =
      (startDate && new Date(startDate).getTime() !== new Date(quiz.startDate).getTime()) ||
      (dueDate && new Date(dueDate).getTime() !== new Date(quiz.dueDate).getTime());

    // Update fields
    quiz.title = title || quiz.title;
    quiz.questions = questions || quiz.questions;
    quiz.startDate = startDate || quiz.startDate;
    quiz.dueDate = dueDate || quiz.dueDate;

    // If timing changed, reset reminderSent flag so new reminder will be sent
    if (timingChanged) {
      quiz.reminderSent = false;
    }

    const updatedQuiz = await quiz.save();

    // --- SEND UPDATE EMAIL IF TIMING CHANGED ---
    if (timingChanged) {
      const classroom = await Classroom.findById(quiz.classId)
        .populate('students', 'email name')
        .populate('teacherId', 'name email');

      if (classroom && classroom.students.length > 0) {
        console.log(`📧 Sending quiz update emails to ${classroom.students.length} students...`);

        const formatTime = (dateString) => {
          return new Date(dateString).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'short'
          });
        };

        classroom.students.forEach(student => {
          sendEmail({
            email: student.email,
            subject: `⚠️ Quiz Timing Updated: ${quiz.title} - ${classroom.name}`,
            message: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
                  <h2 style="color: white; margin: 0; font-size: 24px;">⚠️ Quiz Timing Updated</h2>
                </div>
                
                <p style="font-size: 16px; color: #333;">Hello <strong>${student.name}</strong>,</p>
                <p style="color: #666; line-height: 1.6;">Your teacher has updated the quiz timing. Please note the new schedule:</p>
                
                <div style="background-color: #faf5ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea;">
                  <p style="margin: 8px 0;"><strong style="color: #9333ea;">📚 Class:</strong> ${classroom.name} (${classroom.section})</p>
                  <p style="margin: 8px 0;"><strong style="color: #9333ea;">📖 Subject:</strong> ${classroom.subject}</p>
                  <p style="margin: 8px 0;"><strong style="color: #9333ea;">👨‍🏫 Teacher:</strong> ${classroom.teacherId?.name}</p>
                  <p style="margin: 8px 0;"><strong style="color: #9333ea;">🧠 Quiz:</strong> ${quiz.title}</p>
                  <p style="margin: 8px 0;"><strong style="color: #9333ea;">📝 Questions:</strong> ${quiz.questions.length} questions</p>
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 8px 0; color: #92400e;"><strong>🕐 NEW Start Time:</strong> ${formatTime(quiz.startDate)}</p>
                  <p style="margin: 8px 0; color: #92400e;"><strong>⏳ NEW Due Time:</strong> ${formatTime(quiz.dueDate)}</p>
                </div>
                
                <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <p style="margin: 0; color: #991b1b;"><strong>⚠️ Important:</strong> The quiz schedule has been changed. Please make sure you're available at the new time!</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://edu-nexus-rho.vercel.app/class/${classroom._id}" style="background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">View Updated Quiz</a>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated notification from EduNexus. Please do not reply to this email.</p>
              </div>
            `
          }).catch(err => console.error(`Failed to notify ${student.email}:`, err.message));
        });
      }
    }

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

// ✅ UNIFIED EXPORT (Matched to route names)
module.exports = {
  createQuiz,
  getQuizzesByClass, // <--- Name fixed
  getQuizById,       // <--- Name fixed
  submitQuiz,
  updateQuiz,
  deleteQuiz
};