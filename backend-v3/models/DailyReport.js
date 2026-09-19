const mongoose = require('mongoose')

const StudentEvalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  technical: { type: Number, min: 1, max: 5, default: 5 },
  programming: { type: Number, min: 1, max: 5, default: 5 },
  attention: { type: Number, min: 1, max: 5, default: 5 },
  behavior: { type: Number, min: 1, max: 5, default: 5 },
})

const SessionSchema = new mongoose.Schema({
  technology: { type: String, required: true },
  sessionName: { type: String, required: true },
  studentCount: { type: Number, required: true },
  students: [StudentEvalSchema],
})

const DailyReportSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    instructorName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    day: { type: String, required: true },
    sessions: [SessionSchema],
    tasks: {
      attendingMeetings: { type: Boolean, default: false },
      testingNewStudents: { type: Boolean, default: false },
      preparingForSession: { type: Boolean, default: false },
      takingVideos: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('DailyReport', DailyReportSchema)
