const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Classroom = require('../models/Classroom');
const sendEmail = require('../utils/sendEmail');

// @desc    Create Assignment & Notify Students
const createAssignment = async (req, res) => {
    const { classId, title, description, dueDate } = req.body;
    const fileUrl = req.file ? `https://edunexus-api-w6xc.onrender.com/uploads/${req.file.filename}` : null;

    try {
        const newAssignment = new Assignment({ classId, title, description, dueDate, fileUrl });
        await newAssignment.save();

        // --- EMAIL NOTIFICATION ---
        const classroom = await Classroom.findById(classId)
            .populate('students', 'email name')
            .populate('teacherId', 'name email');

        if (classroom && classroom.students.length > 0) {
            console.log(`Sending assignment emails to ${classroom.students.length} students...`);

            classroom.students.forEach(student => {
                sendEmail({
                    email: student.email,
                    subject: `📝 New Assignment: ${title} - ${classroom.name}`,
                    message: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%); padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
                <h2 style="color: white; margin: 0; font-size: 24px;">📝 New Assignment Posted</h2>
              </div>
              
              <p style="font-size: 16px; color: #333;">Hello <strong>${student.name}</strong>,</p>
              <p style="color: #666; line-height: 1.6;">Your teacher has posted a new assignment. Please review the details below:</p>
              
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p style="margin: 8px 0;"><strong style="color: #16a34a;">📚 Class:</strong> ${classroom.name} (${classroom.section})</p>
                <p style="margin: 8px 0;"><strong style="color: #16a34a;">📖 Subject:</strong> ${classroom.subject}</p>
                <p style="margin: 8px 0;"><strong style="color: #16a34a;">👨‍🏫 Teacher:</strong> ${classroom.teacherId?.name}</p>
                <p style="margin: 8px 0;"><strong style="color: #16a34a;">📝 Assignment:</strong> ${title}</p>
              </div>
              
              <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e;"><strong>📅 Due Date:</strong> ${new Date(dueDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })}</p>
              </div>
              
              ${description ? `<div style="margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Instructions:</p>
                <p style="color: #666; line-height: 1.6; background-color: #f8fafc; padding: 15px; border-radius: 8px;">${description}</p>
              </div>` : ''}
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://edu-nexus-rho.vercel.app/class/${classId}" style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);">View Assignment</a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated notification from EduNexus. Please do not reply to this email.</p>
            </div>
          `
                }).catch(err => console.error(`Failed to notify ${student.email}:`, err.message));
            });
        }

        res.status(201).json(newAssignment);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get Assignments
const getAssignments = async (req, res) => {
    try {
        const { classId } = req.params;
        const assignments = await Assignment.find({ classId }).sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Submit Assignment
const submitAssignment = async (req, res) => {
    const { assignmentId, studentId } = req.body;
    const fileUrl = req.file ? `https://edunexus-api-w6xc.onrender.com/uploads/${req.file.filename}` : null;
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