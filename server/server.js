require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron'); 
const http = require('http'); // <--- IMPORT HTTP
const { Server } = require('socket.io'); // <--- IMPORT SOCKET.IO

// Models & Utils
const Quiz = require('./models/Quiz'); 
const Classroom = require('./models/Classroom');
const sendEmail = require('./utils/sendEmail');

// Routes
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const quizRoutes = require('./routes/quizRoutes');

const app = express();
const server = http.createServer(app); // <--- WRAP APP IN SERVER

// 1. Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from Vercel
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Routes
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
                            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                                <h2 style="color: #ef4444;">Quiz Starting Soon! ⏰</h2>
                                <p>Get ready. The quiz <strong>${quiz.title}</strong> starts in 15 minutes.</p>
                                <p><strong>Start Time:</strong> ${new Date(quiz.startDate).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                                <br>
                                <a href="https://edu-nexus-teal.vercel.app/class/${quiz.classId}" style="background:#ef4444; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Go to Class</a>
                            </div>
                          `
                      }).catch(err => console.log(`Failed to send reminder to ${student.email}`));
                  });
              }
          }
      }
  } catch (err) {
      console.error("Cron Job Error:", err);
  }
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_class', (classId) => {
    socket.join(classId);
    console.log(`User ${socket.id} joined class ${classId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes (Optional)
app.set('io', io);

const PORT = process.env.PORT || 10000;

// 🚨 CRITICAL: Use server.listen instead of app.listen
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));