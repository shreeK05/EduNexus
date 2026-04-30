const Announcement = require('../models/Announcement');
const Assignment = require('../models/Assignment');
const Classroom = require('../models/Classroom');

// @desc    Get recent activity across all user's classes
const getRecentActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all classes the user is in
    const classes = await Classroom.find({
      $or: [{ teacherId: userId }, { students: userId }]
    });
    
    const classIds = classes.map(c => c._id);
    
    // Fetch latest announcements
    const announcements = await Announcement.find({ classId: { $in: classIds } })
      .populate('senderId', 'name')
      .populate('classId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
      
    // Fetch latest assignments
    const assignments = await Assignment.find({ classId: { $in: classIds } })
      .populate('classId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
      
    // Combine and sort
    const combined = [
      ...announcements.map(a => ({
        _id: a._id,
        type: 'announcement',
        title: 'New Announcement',
        content: a.content,
        sender: a.senderId?.name,
        className: a.classId?.name,
        classId: a.classId?._id,
        createdAt: a.createdAt
      })),
      ...assignments.map(a => ({
        _id: a._id,
        type: 'assignment',
        title: 'New Assignment',
        content: a.title,
        sender: 'System',
        className: a.classId?.name,
        classId: a.classId?._id,
        createdAt: a.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    res.json(combined);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecentActivity };
