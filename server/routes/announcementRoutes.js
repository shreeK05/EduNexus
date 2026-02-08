const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');

router.post('/create', createAnnouncement);
router.get('/:classId', getAnnouncements);

module.exports = router;