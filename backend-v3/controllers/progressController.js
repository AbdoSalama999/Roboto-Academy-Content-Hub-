const Progress = require('../models/Progress')

// @desc    جلب الـ checkpoints المكتملة الخاصة بالمستخدم الحالي في كورس معين
// @route   GET /api/progress/:courseId
// @access  Private
exports.getMyProgress = async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = String(req.user.id)

    const records = await Progress.find({
      courseId,
      userId,
      completed: true,
    }).select('sessionId checkpointId')

    // نرجعها كـ array من مفاتيح "sessionId:checkpointId" لسهولة المطابقة في الفرونت
    res.status(200).json({
      success: true,
      completed: records.map((r) => `${r.sessionId}:${r.checkpointId}`),
    })
  } catch (error) {
    console.error('Error in getMyProgress:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    تبديل حالة checkpoint معين خاصة بالمستخدم الحالي فقط
// @route   PATCH /api/progress/:courseId/sessions/:sessionId/checkpoints/:checkpointId
// @access  Private
exports.toggleMyCheckpoint = async (req, res) => {
  try {
    const { courseId, sessionId, checkpointId } = req.params
    const { completed } = req.body
    const userId = String(req.user.id)

    const record = await Progress.findOneAndUpdate(
      { userId, courseId, sessionId, checkpointId },
      {
        $set: {
          completed: Boolean(completed),
          userName: req.user.name || req.user.email,
          userEmail: req.user.email,
        },
      },
      { new: true, upsert: true },
    )

    res.status(200).json({ success: true, data: record })
  } catch (error) {
    console.error('Error in toggleMyCheckpoint:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
