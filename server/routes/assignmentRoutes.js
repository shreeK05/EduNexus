const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware'); // Import Multer

const { 
  createAssignment, 
  getAssignments, 
  submitAssignment, // <--- New Import
  getSubmissions,   // <--- New Import
  gradeSubmission   // <--- New Import
} = require('../controllers/assignmentController');

// --- ROUTES ---

// 1. Create Assignment (Teacher) - with file upload
router.post('/create', upload.single('file'), createAssignment);

// 2. Get Assignments for a Class (All Users)
router.get('/:classId', getAssignments);

// 3. Submit Assignment (Student) - with file upload
router.post('/submit', upload.single('file'), submitAssignment);

// 4. Get Submissions for an Assignment (Teacher)
router.get('/:id/submissions', getSubmissions);

// 5. Grade a Submission (Teacher)
router.put('/grade/:submissionId', gradeSubmission);

module.exports = router;