// server/controllers/authController.js
const User = require('../models/User');
const Classroom = require('../models/Classroom'); // <--- 1. IMPORT CLASSROOM MODEL
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash the password (Security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // 4. Send response back
    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check for user email
    const user = await User.findOne({ email });

    // 2. Check password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete User Account AND Their Classes
// @route   DELETE /api/auth/delete
const deleteAccount = async (req, res) => {
  try {
    // 1. Delete all classes where this user is the teacher
    // (This ensures no 'zombie' classes are left behind)
    await Classroom.deleteMany({ teacherId: req.user.id }); 

    // 2. Delete the user found by ID (req.user comes from auth middleware)
    await User.findByIdAndDelete(req.user.id);
    
    res.json({ msg: "Account and associated classes deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- EXPORT ALL FUNCTIONS TOGETHER ---
module.exports = {
  registerUser,
  loginUser,
  deleteAccount 
};