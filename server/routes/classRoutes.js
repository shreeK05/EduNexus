const express = require('express');
const router = express.Router();
const { 
  createClassroom, 
  joinClassroom, 
  MyClasses, 
  getSingleClass,
  getClassAnalytics,
  toggleLiveStatus // <--- Ensure this matches the export name above
} = require('../controllers/classController');

router.post('/create', createClassroom);
router.post('/join', joinClassroom);
router.get('/:userId', MyClasses);
router.get('/details/:id', getSingleClass);
router.get('/:id/analytics', getClassAnalytics);
router.put('/:id/live', toggleLiveStatus); // <--- Error happens here if toggleLiveStatus is undefined

module.exports = router;