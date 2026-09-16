const mongoose = require('mongoose')

const CheckpointSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
})

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
})

const SessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  files: [FileSchema],
  checkpoints: [CheckpointSchema],
})

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true,
    },
    sessions: [SessionSchema],
  },
  {
    timestamps: true,
  },
)

// تصدير آمن يمنع Re-compilation للموديل
module.exports =
  mongoose.models.Course || mongoose.model('Course', CourseSchema)
