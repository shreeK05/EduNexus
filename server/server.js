const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron'); 
const Quiz = require('./models/Quiz'); 
const Classroom = require('./models/Classroom');
const sendEmail = require('./utils/sendEmail');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve Static Files (Assignments)
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const quizRoutes = require('./routes/quizRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/quizzes', quizRoutes);

// --- CRON JOB: CHECK FOR UPCOMING QUIZZES (EVERY MINUTE) ---
cron.schedule('* * * * *', async () => {
  const now = new Date();
  // Check for quizzes starting in the next 15-16 minutes
  const targetTime = new Date(now.getTime() + 15 * 60000); 

  try {
      const upcomingQuizzes = await Quiz.find({
          startDate: {
              $gte: targetTime,
              $lt: new Date(targetTime.getTime() + 60000)
          }
      });

      if (upcomingQuizzes.length > 0) {
          console.log(`Found ${upcomingQuizzes.length} upcoming quizzes.`);
          
          for (const quiz of upcomingQuizzes) {
              const classroom = await Classroom.findById(quiz.classId).populate('students', 'email');
              if (classroom && classroom.students.length > 0) {
                  classroom.students.forEach(student => {
                      sendEmail({
                          email: student.email,
                          subject: `⏰ Quiz Reminder: ${quiz.title}`,
                          message: `
                            <h3>Quiz Starting in 15 Minutes!</h3>
                            <p>Get ready. The quiz <strong>${quiz.title}</strong> starts at ${new Date(quiz.startDate).toLocaleTimeString()}.</p>
                            <br>
                            <a href="http://localhost:5173/class/${quiz.classId}" style="background:#9333ea; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Go to Class</a>
                          `
                      }).catch(err => console.log(err));
                  });
              }
          }
      }
  } catch (err) {
      console.error("Cron Job Error:", err);
  }
});

// Database Connection (FIXED: Removed deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));