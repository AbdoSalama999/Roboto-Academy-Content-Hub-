const DailyReport = require('../models/DailyReport')

// 1. حفظ التقرير اليومي للمهندس
exports.createReport = async (req, res) => {
  try {
    const newReport = new DailyReport({
      ...req.body,
      instructorId: req.user.id || req.user._id,
      instructorName: req.user.name || req.body.instructorName,
    })
    const savedReport = await newReport.save()
    res.status(201).json({ success: true, data: savedReport })
  } catch (err) {
    console.error('Error in createReport:', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// 2. للأدمن: جلب جميع التقارير مع فلترة التاريخ
exports.getReportsByDate = async (req, res) => {
  try {
    const { date } = req.query
    let query = {}

    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)

      const end = new Date(date)
      end.setHours(23, 59, 59, 999)

      query = {
        $or: [{ date: date }, { createdAt: { $gte: start, $lte: end } }],
      }
    }

    const reports = await DailyReport.find(query)
      .populate({
        path: 'instructorId',
        select: 'name email',
        strictPopulate: false,
      })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    })
  } catch (err) {
    console.error('Error in getReportsByDate:', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// 3. للأدمن: حساب إحصائيات مهندس معين
exports.getInstructorStats = async (req, res) => {
  try {
    const { instructorId } = req.params
    const reports = await DailyReport.find({ instructorId })

    let totalSessions = 0
    let totalStudents = 0
    let ratings = {
      technical: 0,
      programming: 0,
      attention: 0,
      behavior: 0,
      count: 0,
    }

    reports.forEach((report) => {
      report.sessions?.forEach((session) => {
        totalSessions++
        totalStudents += session.students?.length || session.studentCount || 0

        session.students?.forEach((st) => {
          ratings.technical += st.technical || 0
          ratings.programming += st.programming || 0
          ratings.attention += st.attention || 0
          ratings.behavior += st.behavior || 0
          ratings.count++
        })
      })
    })

    const averages =
      ratings.count > 0
        ? {
            technical: (ratings.technical / ratings.count).toFixed(1),
            programming: (ratings.programming / ratings.count).toFixed(1),
            attention: (ratings.attention / ratings.count).toFixed(1),
            behavior: (ratings.behavior / ratings.count).toFixed(1),
          }
        : { technical: 0, programming: 0, attention: 0, behavior: 0 }

    res.status(200).json({
      success: true,
      stats: {
        totalReports: reports.length,
        totalSessions,
        totalStudents,
        averages,
      },
    })
  } catch (err) {
    console.error('Error in getInstructorStats:', err)
    res.status(500).json({ success: false, message: err.message })
  }
}
