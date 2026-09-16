const Track = require('../models/Track.js')
const Course = require('../models/Course.js')

exports.createTrack = async (req, res) => {
  try {
    const newTrack = new Track(req.body)
    await newTrack.save()
    res.status(201).json({ success: true, data: newTrack })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getAllTracks = async (req, res) => {
  try {
    const tracks = await Track.find().populate({
      path: 'courses',
      select: 'title',
    })
    res.status(200).json({ success: true, data: tracks })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
