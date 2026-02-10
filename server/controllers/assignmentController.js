const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Classroom = require('../models/Classroom');
const sendEmail = require('../utils/sendEmail');

// @desc    Create Assignment & Notify Students
const createAssignment = async (req, res) => {
  const { classId, title, description, dueDate } = req.body;
  const fileUrl = req.file ? `https://https://edunexus-api-o8qg.onrender.com/uploads/${req.file.filename}` : null;

  try {
    const newAssignment = new Assignment({ classId, title, description, dueDate, fileUrl });
    await newAssignment.save();

    // --- EMAIL NOTIFICATION ---
    const classroom = await Classroom.findById(classId).populate('students', 'email name');

    if (classroom && classroom.students.length > 0) {
        console.log(`Sending assignment emails to ${classroom.students.length} students...`);
        
        classroom.students.forEach(student => {
            sendEmail({
                email: student.email,
                subject: `📝 New Assignment: ${title}`,
                message: `
                  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #16a34a;">New Assignment Posted 📝</h2>
                    <p><strong>Class:</strong> ${classroom.name}</p>
                    <p><strong>Assignment:</strong> ${title}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                    <p>${description}</p>
                    <p>
                        <strong>📅 Due Date:</strong> 
                        ${new Date(dueDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <div style="margin-top: 20px;">
                        <a href="https://edu-nexus-teal.vercel.app/class/${classId}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Assignment</a>
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

    res.status(201).json(newAssignment);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get Assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ classId: req.params.classId }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Submit Assignment
const submitAssignment = async (req, res) => {
    const { assignmentId, studentId } = req.body;
    const fileUrl = req.file ? `https://https://edunexus-api-o8qg.onrender.com/uploads/${req.file.filename}` : null;
    try {
        const submission = new Submission({ assignmentId, studentId, fileUrl });
        await submission.save();
        res.status(201).json({ message: 'Submitted successfully' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get Submissions for an Assignment (Teacher View)
const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
            .populate('studentId', 'name email');
        res.json(submissions);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Grade Submission
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