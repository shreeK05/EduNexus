// server/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Set Storage Engine
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, 'file-' + Date.now() + path.extname(file.originalname));
  },
});

// Check File Type
const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|pdf|doc|docx|txt|c|cpp|java|py|js|html|css/;
    
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    // Check mime type (We relax this slightly for code files as they often have generic mime types)
    // For code/docs, we mainly trust the extension in this simple project
    if (extname) {
        return cb(null, true);
    } else {
        cb('Error: File type not supported!');
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Increased limit to 10MB
});

module.exports = upload;