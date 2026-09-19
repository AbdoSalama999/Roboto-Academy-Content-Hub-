const jwt = require('jsonwebtoken')
const ALLOWED_USERS = require('../config/allowedUsers')

// @desc    Authenticate user & get JWT token
// @route   POST /api/auth/login
exports.loginUser = (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      })
    }

    // 2. Check if email is in the allowed whitelist
    const foundUser = ALLOWED_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    )

    if (!foundUser) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: This email address is not authorized.',
      })
    }

    // 3. Validate password
    if (foundUser.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Incorrect password.',
      })
    }

    // 4. Generate JWT Token
    const payload = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    )

    // 5. Send response with token & user details
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token: token,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error during login process.',
      error: error.message,
    })
  }
}
