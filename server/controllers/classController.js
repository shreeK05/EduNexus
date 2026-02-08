const Classroom = require('../models/Classroom');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
//const sendEmail = require('../utils/sendEmail'); 

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

    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({ assignmentId: { $in: assignmentIds } });
    const quizIds = quizzes.map(q => q._id);
    const quizResults = await QuizResult.find({ quizId: { $in: quizIds } });

    res.json({ assignments, submissions, quizzes, quizResults });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Toggle Live Status & Notify
const toggleLiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isLive } = req.body;
    
    const classroom = await Classroom.findByIdAndUpdate(id, { isLive }, { new: true });
    
    if (!classroom) return res.status(404).json({ message: 'Class not found' });

    // --- TEMPORARILY DISABLED EMAIL TO FIX CRASH ---
    /* if (isLive && classroom.students.length > 0) {
        classroom.students.forEach(student => {
             sendEmail({ ... });
        });
    }
    */
    
    res.json(classroom);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Delete a Class (New Feature)
const deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is the teacher who owns this class
    // req.user is set by the 'auth' middleware
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

module.exports = { 
    createClassroom, 
    joinClassroom, 
    MyClasses, 
    getSingleClass, 
    getClassAnalytics, 
    toggleLiveStatus,
    deleteClassroom // <--- Exported here
};