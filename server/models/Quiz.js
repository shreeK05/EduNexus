const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  title: { type: String, required: true },
  questions: [
    {
      question: String,
      options: [String],
      correct: Number, // Index of correct option (0-3)
      type: { type: String, default: 'single' }
    }
  ],
  startDate: { type: Date, required: true }, // <--- START TIME
  dueDate: { type: Date, required: true },   // <--- END TIME (Expire)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);