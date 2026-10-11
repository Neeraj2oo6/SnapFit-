const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, findUserById } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * POST /api/auth/register
 * Accepts all user biometric and goal parameters, hashes password, saves to DB.
 */
async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      dob,
      gender,
      height,
      weight,
      goal,
      activityLevel
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email, and Password are required.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.'
      });
    }

    // Check existing
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await createUser({
      name,
      email,
      passwordHash,
      dob,
      gender: gender || 'Male',
      heightCm: Number(height) || 175,
      weightKg: Number(weight) || 70,
      goal: goal || 'Build Muscle',
      activityLevel: activityLevel || 'Moderate'
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login with your credentials.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        dob: newUser.dob,
        gender: newUser.gender,
        height: newUser.height_cm,
        weight: newUser.weight_kg,
        goal: newUser.goal,
        activityLevel: newUser.activity_level
      }
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed.'
    });
  }
}

/**
 * POST /api/auth/login
 * Validates email & password hash with bcrypt, issues JWT token.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    // Compare bcrypt password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        height: user.height_cm,
        weight: user.weight_kg,
        goal: user.goal,
        activityLevel: user.activity_level
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed.'
    });
  }
}

/**
 * GET /api/auth/profile
 * Returns profile for logged-in user.
 */
async function getProfile(req, res) {
  try {
    const userId = req.user?.id || 1;
    const user = await findUserById(userId);
    if (!user) {
      return res.json({
        success: true,
        user: {
          id: 1,
          name: 'SnapFit User',
          email: 'user@snapfit.ai',
          goal: 'Build Muscle',
          activityLevel: 'Moderate'
        }
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  register,
  login,
  getProfile
};
