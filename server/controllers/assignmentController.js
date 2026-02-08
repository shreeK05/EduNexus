const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Classroom = require('../models/Classroom');
const sendEmail = require('../utils/sendEmail');

// @desc Create Assignment & Notify Students
const createAssignment = async (req, res) => {
  const { classId, title, description, dueDate } = req.body;
  const fileUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

  try {
    const newAssignment = new Assignment({ classId, title, description, dueDate, fileUrl });
    await newAssignment.save();

    // --- EMAIL NOTIFICATION ---
    const classroom = await Classroom.findById(classId).populate('students', 'email name');

    if (classroom && classroom.students.length > 0) {
        classroom.students.forEach(student => {
            sendEmail({
                email: student.email,
                subject: `📝 New Assignment: ${title}`,
                message: `
                    <h3>New Assignment: ${title}</h3>
                    <p>${description}</p>
                    <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleString()}</p>
                    <br>
                    <a href="http://localhost:5173/class/${classId}" style="background:#4f46e5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View Assignment</a>
                `
            }).catch(err => console.error(err));
        });
    }

    res.status(201).json(newAssignment);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc Get Assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ classId: req.params.classId }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc Submit Assignment
const submitAssignment = async (req, res) => {
    const { assignmentId, studentId } = req.body;
    const fileUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;
    try {
        const submission = new Submission({ assignmentId, studentId, fileUrl });
        await submission.save();
        res.status(201).json({ message: 'Submitted successfully' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc Get Submissions for an Assignment (Teacher View)
const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
            .populate('studentId', 'name email');
        res.json(submissions);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc Grade Submission
const gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            { grade, feedback, status: 'Graded' },
            { new: true }
        );
        res.json(submission);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { 
    createAssignment, 
    getAssignments, 
    submitAssignment, 
    getSubmissions,
    gradeSubmission 
};