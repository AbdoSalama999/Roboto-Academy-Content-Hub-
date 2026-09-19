const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/authMiddleware')
const {
  logActivity,
  getActivitySummary,
} = require('../controllers/activityController')

// تسجيل نشاط (تحميل ملف) للمستخدم الحالي
router.post('/', protect, logActivity)

// ملخص التحميلات لكل مستخدم كل يوم (أدمن فقط)
router.get('/summary', protect, adminOnly, getActivitySummary)

module.exports = router
