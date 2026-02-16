const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements, deleteAnnouncement } = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createAnnouncement);
router.get('/:classId', getAnnouncements); // Public or Protected? Usually protected but let's leave as is or add protect if frontend sends token (it does).
router.delete('/:id', protect, deleteAnnouncement);

module.exports = router;