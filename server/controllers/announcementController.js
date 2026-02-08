const Announcement = require('../models/Announcement');
const Classroom = require('../models/Classroom');
const sendEmail = require('../utils/sendEmail');

// @desc Create Announcement & Notify Students
const createAnnouncement = async (req, res) => {
  const { classId, senderId, content } = req.body;
  try {
    const newAnnouncement = new Announcement({ classId, senderId, content });
    await newAnnouncement.save();

    // --- EMAIL NOTIFICATION ---
    const classroom = await Classroom.findById(classId).populate('students', 'email name');
    
    if (classroom && classroom.students.length > 0) {
        console.log(`Sending emails to ${classroom.students.length} students...`);
        
        classroom.students.forEach(student => {
            sendEmail({
                email: student.email,
                subject: `📢 New Announcement: ${classroom.name}`,
                message: `
                    <h3>New Announcement Posted</h3>
                    <p><strong>Class:</strong> ${classroom.name}</p>
                    <p><strong>Message:</strong> "${content}"</p>
                    <br>
                    <a href="http://localhost:5173/class/${classId}" style="background:#4f46e5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View Class</a>
                `
            }).catch(err => console.error(`Failed to send to ${student.email}`, err));
        });
    }

    res.status(201).json(newAnnouncement);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc Get Announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ classId: req.params.classId })
      .populate('senderId', 'name')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createAnnouncement, getAnnouncements };