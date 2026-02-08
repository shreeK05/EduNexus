const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // <--- Import Auth Middleware

const { 
  createClassroom, 
  joinClassroom, 
  MyClasses, 
  getSingleClass,
  getClassAnalytics,
  toggleLiveStatus,
  deleteClassroom // <--- Import the new Delete function
} = require('../controllers/classController');

router.post('/create', createClassroom);
router.post('/join', joinClassroom);
router.get('/:userId', MyClasses);
router.get('/details/:id', getSingleClass);
router.get('/:id/analytics', getClassAnalytics);
router.put('/:id/live', toggleLiveStatus);

// New Delete Route (Protected by Auth)
router.delete('/:id', auth, deleteClassroom); 

module.exports = router;