const express = require('express')
const router = express.Router()
const {
  createCourse,
  getAllCourses,
  getCourseById,
  addSessionToCourse,
  updateCourse,
  deleteCourse,
  getCourseSessions,
  updateCheckpoints,
} = require('../controllers/courseController')

// استيراد حراس الحماية
const { protect, adminOnly } = require('../middleware/authMiddleware')

// 1. المسارات العامة والإنشاء
router.route('/').get(getAllCourses).post(protect, adminOnly, createCourse)

// 2. إدارة الكورس بـ ID
router
  .route('/:id')
  .get(getCourseById)
  .put(protect, adminOnly, updateCourse)
  .delete(protect, adminOnly, deleteCourse)

// 3. إدارة جلسات الكورس
router
  .route('/:id/sessions')
  .get(protect, getCourseSessions)
  .post(protect, adminOnly, addSessionToCourse)

// 4. تحديث حالة الـ Checkpoints
router.patch('/:id/sessions/:sessionId/checkpoints', protect, updateCheckpoints)

router.patch(
  '/:id/sessions/:sessionId/checkpoints/:checkpointId',
  protect,
  updateCheckpoints,
)

module.exports = router
