const express = require('express')
const router = express.Router()
const { loginUser } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// Public route for login
router.post('/login', loginUser)

// Example protected route testing JWT authentication
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized access confirmed.',
    user: req.user,
  })
})

module.exports = router
