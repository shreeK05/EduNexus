const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  title: { type: String, required: true },
  questions: [
    {
      question: String,
      options: [String],
      correct: { type: [Number], required: true }, // Array of indices (e.g., [0, 2])
      type: { type: String, default: 'single', enum: ['single', 'multi'] }
    }
  ],
  startDate: { type: Date, required: true }, // <--- START TIME
  dueDate: { type: Date, required: true },   // <--- END TIME (Expire)
  reminderSent: { type: Boolean, default: false }, // Track if 30-min reminder was sent
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);