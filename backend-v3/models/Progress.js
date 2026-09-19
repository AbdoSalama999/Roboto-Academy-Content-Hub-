const mongoose = require('mongoose')

// 🎯 تتبع تقدّم كل مستخدم لوحده في الـ checkpoints بتاعة كل سيشن
const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String },
    userEmail: { type: String },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    sessionId: { type: String, required: true },
    checkpointId: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// كل مستخدم له سجل واحد بس لكل checkpoint
ProgressSchema.index(
  { userId: 1, courseId: 1, sessionId: 1, checkpointId: 1 },
  { unique: true },
)

module.exports = mongoose.model('Progress', ProgressSchema)
