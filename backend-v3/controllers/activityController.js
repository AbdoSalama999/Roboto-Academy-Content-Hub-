const ActivityLog = require('../models/ActivityLog')

// @desc    تسجيل نشاط (تحميل ملف / فتح سيشن) للمستخدم الحالي
// @route   POST /api/activity
// @access  Private
exports.logActivity = async (req, res) => {
  try {
    const { action, courseId, courseTitle, sessionTitle, fileName } = req.body

    if (!action) {
      return res
        .status(400)
        .json({ success: false, message: 'Action type is required.' })
    }

    const log = await ActivityLog.create({
      userId: String(req.user.id),
      userName: req.user.name || req.user.email,
      userEmail: req.user.email,
      action,
      courseId,
      courseTitle,
      sessionTitle,
      fileName,
    })

    res.status(201).json({ success: true, data: log })
  } catch (error) {
    console.error('Error in logActivity:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    ملخص للأدمن: كل مستخدم، إيه اللي نزّله، كل يوم
// @route   GET /api/activity/summary?name=&date=
// @access  Private / Admin
exports.getActivitySummary = async (req, res) => {
  try {
    const { name, date } = req.query
    const query = { action: 'download' }

    if (name) {
      query.userName = { $regex: name, $options: 'i' }
    }

    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      query.createdAt = { $gte: start, $lte: end }
    }

    const logs = await ActivityLog.find(query).sort({ createdAt: -1 })

    // تجميع النتائج حسب المستخدم + اليوم
    const groups = {}
    logs.forEach((log) => {
      const day = log.createdAt.toISOString().split('T')[0]
      const key = `${log.userId}_${day}`

      if (!groups[key]) {
        groups[key] = {
          userId: log.userId,
          userName: log.userName,
          date: day,
          downloads: [],
        }
      }

      groups[key].downloads.push({
        courseTitle: log.courseTitle,
        sessionTitle: log.sessionTitle,
        fileName: log.fileName,
        time: log.createdAt,
      })
    })

    const summary = Object.values(groups).sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    )

    res.status(200).json({ success: true, count: summary.length, data: summary })
  } catch (error) {
    console.error('Error in getActivitySummary:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
