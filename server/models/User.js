// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['TEACHER', 'STUDENT'], // Only these two roles allowed
    default: 'STUDENT',
  },
  joinedClassrooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);