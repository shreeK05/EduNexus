const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isLive: { type: Boolean, default: false }, // <--- ADD THIS LINE
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Classroom', ClassroomSchema);