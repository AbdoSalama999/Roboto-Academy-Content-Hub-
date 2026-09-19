const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getMyProgress,
  toggleMyCheckpoint,
} = require('../controllers/progressController')

// جلب تقدّم المستخدم الحالي في كورس معين
router.get('/:courseId', protect, getMyProgress)

// تبديل حالة checkpoint خاصة بالمستخدم الحالي فقط
router.patch(
  '/:courseId/sessions/:sessionId/checkpoints/:checkpointId',
  protect,
  toggleMyCheckpoint,
)

module.exports = router
