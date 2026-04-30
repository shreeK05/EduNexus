const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRecentActivity } = require('../controllers/activityController');

router.get('/:userId', protect, getRecentActivity);

module.exports = router;
