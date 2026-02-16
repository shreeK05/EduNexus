require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // <--- IMPORT HTTP
const { Server } = require('socket.io'); // <--- IMPORT SOCKET.IO

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
    origin: ["https://edu-nexus-rho.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["https://edu-nexus-rho.vercel.app", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/quizzes', quizRoutes);

// --- QUIZ REMINDER SCHEDULER ---
const scheduleQuizReminders = require('./utils/quizReminderScheduler');
scheduleQuizReminders(); // Start the scheduler

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// --- SOCKET.IO LOGIC ---
// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join Class Room (for chat/announcements if needed)
  socket.on('join_class', (classId) => {
    socket.join(classId);
  });

  // 1. Join Quiz Room (Students & Teachers)
  socket.on('join_quiz', (quizId) => {
    socket.join(quizId);
    console.log(`User ${socket.id} joined quiz ${quizId}`);
  });

  // 2. Student Reports Status (Active, Cheating, Frozen) -> To Teacher
  socket.on('report_status', (data) => {
    // Broadcast to everyone in the quiz room (Teacher will pick it up)
    // or specifically to teacher if we knew their ID. 
    // Broadcasting to room is easiest for now.
    io.to(data.quizId).emit('update_dashboard', data);
  });

  // 3. Teacher Actions (Warn, Freeze) -> To Specific Student
  socket.on('teacher_action', (data) => {
    // data: { studentSocketId, action }
    io.to(data.studentSocketId).emit('student_action', data.action);
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