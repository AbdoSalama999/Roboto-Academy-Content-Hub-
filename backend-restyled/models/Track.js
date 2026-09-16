const mongoose = require('mongoose')

const trackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

trackSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'trackId',
})

module.exports = mongoose.model('Track', trackSchema)
