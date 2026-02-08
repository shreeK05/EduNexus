const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  fileUrl: { type: String }, // Link to the PDF on Cloudinary
  fileName: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);