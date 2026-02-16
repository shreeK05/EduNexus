const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // <--- Import Auth Middleware

const {
  createClassroom,
  joinClassroom,
  MyClasses,
  getSingleClass,
  getClassAnalytics,
  toggleLiveStatus,
  deleteClassroom,
  removeStudent
} = require('../controllers/classController');

router.post('/create', protect, createClassroom);
router.post('/join', protect, joinClassroom);
router.get('/:userId', protect, MyClasses);
router.get('/details/:id', protect, getSingleClass);
router.get('/:id/analytics', protect, getClassAnalytics);
router.put('/:id/live', protect, toggleLiveStatus);

// New Delete Route (Protected by Auth)
// New Delete Route (Protected by Auth)
router.delete('/:id', protect, deleteClassroom);

// Remove Student
router.delete('/:id/students/:studentId', protect, removeStudent);

module.exports = router;