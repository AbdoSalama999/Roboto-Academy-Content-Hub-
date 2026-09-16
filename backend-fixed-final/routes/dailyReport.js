const express = require('express')
const router = express.Router()

// 🔑 اضبط مسار الملف حسب الهيكل المباشر لمشروعك (middleware أو middlewares)
const { protect, adminOnly } = require('../middleware/authMiddleware')

// 🎮 استدعاء Controller
const {
  createReport,
  getReportsByDate,
  getInstructorStats,
} = require('../controllers/dailyReportController')

// 📤 إنشاء تقرير يومي
router.post('/', protect, createReport)

// 📥 جلب جميع التقارير (خاص بالأدمن)
router.get('/', protect, adminOnly, getReportsByDate)

// 📊 إحصائيات محاضر
router.get('/stats/:instructorId', protect, adminOnly, getInstructorStats)

module.exports = router
