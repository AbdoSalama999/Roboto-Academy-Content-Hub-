const express = require('express')
const { getAllTracks, createTrack } = require('../controllers/trackController')
const router = express.Router()
router.get('/', getAllTracks)
router.post('/', createTrack)
module.exports = router
