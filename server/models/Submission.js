const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: { type: String, required: true }, // Link to Student's PDF/Code
  fileName: { type: String },
  submittedAt: { type: Date, default: Date.now },
  
  // Grading Fields
  grade: { type: Number, default: null }, // Null means not graded yet
  feedback: { type: String },
  status: { 
    type: String, 
    enum: ['Submitted', 'Graded', 'Late'], 
    default: 'Submitted' 
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);