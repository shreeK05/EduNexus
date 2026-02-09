const Announcement = require('../models/Announcement');
const Classroom = require('../models/Classroom');
const sendEmail = require('../utils/sendEmail');

// @desc    Create Announcement & Notify Students
const createAnnouncement = async (req, res) => {
  const { classId, senderId, content } = req.body;
  try {
    const newAnnouncement = new Announcement({ classId, senderId, content });
    await newAnnouncement.save();

    // --- EMAIL NOTIFICATION ---
    const classroom = await Classroom.findById(classId).populate('students', 'email name');
    
    if (classroom && classroom.students.length > 0) {
        console.log(`Sending announcement emails to ${classroom.students.length} students...`);
        
        classroom.students.forEach(student => {
            sendEmail({
                email: student.email,
                subject: `📢 New Announcement: ${classroom.name}`,
                message: `
                  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #4f46e5;">New Announcement Posted 📢</h2>
                    <p><strong>Class:</strong> ${classroom.name}</p>
                    <p><strong>Message:</strong></p>
                    <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4f46e5; margin: 0;">
                        "${content}"
                    </blockquote>
                    <br>
                    <div style="margin-top: 20px;">
                        <a href="https://edu-nexus-teal.vercel.app/class/${classId}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Class</a>
                    </div>
                  </div>
                `
            })
            .then(() => console.log(`✅ Email sent to ${student.email}`))
            .catch(err => {
                console.log(`❌ FAILED for ${student.email}`);
                console.log(`REASON: ${err.message}`);
            });
        });
    }

    res.status(201).json(newAnnouncement);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get Announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ classId: req.params.classId })
      .populate('senderId', 'name')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createAnnouncement, getAnnouncements };