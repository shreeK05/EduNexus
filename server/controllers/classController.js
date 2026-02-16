const Classroom = require('../models/Classroom');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const sendEmail = require('../utils/sendEmail');

// Helper: Generate random 6-char code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// @desc    Create a new Class
const createClassroom = async (req, res) => {
  const { name, section, subject, teacherId } = req.body;
  try {
    const newClass = new Classroom({
      name, section, subject, teacherId,
      code: generateCode(),
    });
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Join a Class
const joinClassroom = async (req, res) => {
  const { code, studentId } = req.body;
  try {
    const classroom = await Classroom.findOne({ code });
    if (!classroom) return res.status(404).json({ message: 'Invalid Class Code' });
    if (classroom.students.includes(studentId)) return res.status(400).json({ message: 'Already joined' });

    classroom.students.push(studentId);
    await classroom.save();

    const student = await User.findById(studentId);
    student.joinedClassrooms.push(classroom._id);
    await student.save();

    res.status(200).json({ message: 'Joined Successfully', classroom });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get all classes for a user
const MyClasses = async (req, res) => {
  try {
    const classes = await Classroom.find({
      $or: [{ teacherId: req.params.userId }, { students: req.params.userId }],
    }).populate('teacherId', 'name');
    res.json(classes);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get Single Class Details
const getSingleClass = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('students', 'name email');
    if (!classroom) return res.status(404).json({ message: 'Class not found' });
    res.json(classroom);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get Analytics Data
const getClassAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const assignments = await Assignment.find({ classId: id });
    const quizzes = await Quiz.find({ classId: id });

    // Extract IDs to find related submissions and results
    const assignmentIds = assignments.map(a => a._id);
    const quizIds = quizzes.map(q => q._id);

    const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } });
    const quizResults = await QuizResult.find({ quizId: { $in: quizIds } });

    res.json({ assignments, submissions, quizzes, quizResults });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Toggle Live Status & Notify
const toggleLiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isLive } = req.body;

    // We MUST populate 'students' AND 'teacherId' to get their details
    const classroom = await Classroom.findByIdAndUpdate(id, { isLive }, { new: true })
      .populate('students', 'email name')
      .populate('teacherId', 'name email');

    if (!classroom) return res.status(404).json({ message: 'Class not found' });

    // --- EMAIL LOGIC ---
    if (isLive && classroom.students.length > 0) {
      console.log(`🔴 Class is Live! Sending emails to ${classroom.students.length} students...`);

      classroom.students.forEach(student => {
        // Send email to each student
        sendEmail({
          email: student.email,
          subject: `🔴 Live Class Started: ${classroom.name} - ${classroom.subject}`,
          message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
                <h2 style="color: white; margin: 0; font-size: 24px;">🔴 Live Class Started!</h2>
              </div>
              
              <p style="font-size: 16px; color: #333;">Hello <strong>${student.name}</strong>,</p>
              <p style="color: #666; line-height: 1.6;">Your teacher has started a live class. Join now to participate!</p>
              
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 8px 0;"><strong style="color: #dc2626;">📚 Class:</strong> ${classroom.name} (${classroom.section})</p>
                <p style="margin: 8px 0;"><strong style="color: #dc2626;">📖 Subject:</strong> ${classroom.subject}</p>
                <p style="margin: 8px 0;"><strong style="color: #dc2626;">👨‍🏫 Teacher:</strong> ${classroom.teacherId?.name}</p>
                <p style="margin: 8px 0;"><strong style="color: #dc2626;">🕐 Status:</strong> <span style="background-color: #dc2626; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">LIVE NOW</span></p>
              </div>
              
              <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e;"><strong>⚠️ Important:</strong> Please join as soon as possible. The class is already in progress!</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://edu-nexus-teal.vercel.app/class/${classroom._id}" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3); animation: pulse 2s infinite;">Join Live Class Now 📹</a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated notification from EduNexus. Please do not reply to this email.</p>
            </div>
          `
        })
          .then(() => console.log(`✅ Email sent to ${student.email}`))
          .catch(err => {
            console.log(`❌ FAILED for ${student.email}`);
            console.log(`REASON: ${err.message}`); // <--- THIS LOGS THE REAL ERROR
          });
      });
    }
    // ------------------------------------------

    res.json(classroom);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Delete a Class
const deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is the teacher who owns this class
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this class' });
    }

    await classroom.deleteOne();
    res.json({ message: 'Classroom removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove Student from Class
const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const classroom = await Classroom.findById(id);

    if (!classroom) return res.status(404).json({ message: 'Class not found' });

    // Verify Teacher
    if (classroom.teacherId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Remove from Class
    classroom.students = classroom.students.filter(s => s.toString() !== studentId);
    await classroom.save();

    // Remove from Student Profile
    const student = await User.findById(studentId);
    if (student) {
      student.joinedClassrooms = student.joinedClassrooms.filter(c => c.toString() !== id);
      await student.save();
    }

    res.json(classroom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createClassroom,
  joinClassroom,
  MyClasses,
  getSingleClass,
  getClassAnalytics,
  toggleLiveStatus,
  deleteClassroom,
  removeStudent
};