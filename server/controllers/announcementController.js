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
    const classroom = await Classroom.findById(classId)
      .populate('students', 'email name')
      .populate('teacherId', 'name email');

    if (classroom && classroom.students.length > 0) {
      console.log(`Sending announcement emails to ${classroom.students.length} students...`);

      classroom.students.forEach(student => {
        sendEmail({
          email: student.email,
          subject: `📢 New Announcement: ${classroom.name} - ${classroom.subject}`,
          message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
                <h2 style="color: white; margin: 0; font-size: 24px;">📢 New Announcement</h2>
              </div>
              
              <p style="font-size: 16px; color: #333;">Hello <strong>${student.name}</strong>,</p>
              <p style="color: #666; line-height: 1.6;">Your teacher has posted an important announcement for your class:</p>
              
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                <p style="margin: 8px 0;"><strong style="color: #6366f1;">📚 Class:</strong> ${classroom.name} (${classroom.section})</p>
                <p style="margin: 8px 0;"><strong style="color: #6366f1;">📖 Subject:</strong> ${classroom.subject}</p>
                <p style="margin: 8px 0;"><strong style="color: #6366f1;">👨‍🏫 Teacher:</strong> ${classroom.teacherId?.name}</p>
              </div>
              
              <div style="background-color: #eef2ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                <p style="margin: 0 0 8px 0; font-weight: bold; color: #4f46e5; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Message:</p>
                <p style="color: #1e293b; line-height: 1.8; margin: 0; font-size: 15px; white-space: pre-wrap;">${content}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://edu-nexus-rho.vercel.app/class/${classId}" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);">View Class</a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated notification from EduNexus. Please do not reply to this email.</p>
            </div>
          `
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

// @desc    Delete Announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    await announcement.deleteOne();
    res.json({ message: "Announcement removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createAnnouncement, getAnnouncements, deleteAnnouncement };