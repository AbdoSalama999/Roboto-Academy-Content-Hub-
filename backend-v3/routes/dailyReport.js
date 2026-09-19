const express = require('express')
const router = express.Router()

// 🔑 اضبط مسار الملف حسب الهيكل المباشر لمشروعك (middleware أو middlewares)
const { protect, adminOnly } = require('../middleware/authMiddleware')

// 🎮 استدعاء Controller
const {
  createReport,
  getReportsByDate,
  getInstructorStats,
  updateReport,
  deleteReport,
} = require('../controllers/dailyReportController')

// 📤 إنشاء تقرير يومي
router.post('/', protect, createReport)

// 📥 جلب جميع التقارير (خاص بالأدمن)
router.get('/', protect, adminOnly, getReportsByDate)

// 📊 إحصائيات محاضر
router.get('/stats/:instructorId', protect, adminOnly, getInstructorStats)

// ✏️ تعديل تقرير (أدمن فقط)
router.put('/:id', protect, adminOnly, updateReport)

// 🗑️ حذف تقرير (أدمن فقط)
router.delete('/:id', protect, adminOnly, deleteReport)

module.exports = router
