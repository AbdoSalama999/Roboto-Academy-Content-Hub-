const mongoose = require('mongoose')

// 📥 سجل نشاط المستخدمين (تحميل ملفات / فتح سيشنز) لعرضه للأدمن
const ActivityLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String },
    userEmail: { type: String },
    action: {
      type: String,
      enum: ['download', 'view_session'],
      required: true,
    },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseTitle: { type: String },
    sessionTitle: { type: String },
    fileName: { type: String },
  },
  { timestamps: true },
)

module.exports = mongoose.model('ActivityLog', ActivityLogSchema)
