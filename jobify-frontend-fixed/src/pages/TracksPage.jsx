import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTracks } from '../services/api' // 👈 استدعاء الخدمة المركزية
import '../styles/TrackPage.css'

function TracksPage() {
  const navigate = useNavigate()

  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State لتحديد التراك المفتوح حالياً (Accordion)
  const [expandedTrackId, setExpandedTrackId] = useState(null)

  const handleCourseClick = (courseId, e) => {
    e.stopPropagation() // منع انتشار الضغطة للكارت الخارجي
    navigate(`/courses/${courseId}`)
  }

  const toggleTrack = (trackId) => {
    setExpandedTrackId((prev) => (prev === trackId ? null : trackId))
  }

  useEffect(() => {
    const fetchTracksData = async () => {
      try {
        setLoading(true)

        // 👈 استخدام الدالة المركزية التي ترسل التوكن تلقائياً
        const responseData = await getTracks()
        const data = responseData.data || []

        setTracks(data)

        // فتح أول تراك أوتوماتيكياً لإعطاء انطباع ممتاز
        if (data.length > 0) {
          setExpandedTrackId(data[0]._id)
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching tracks:', err)
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load tracks details.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTracksData()
  }, [])

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          marginTop: '100px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <h2>Loading tracks... ⏳</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          textAlign: 'center',
          marginTop: '100px',
          color: '#ef4444',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <h2>{error}</h2>
      </div>
    )
  }

  return (
    <div className='tracks-container'>
      {/* Header */}
      <header className='tracks-header'>
        <h1>🎓 Academy Learning Paths</h1>
        <p>
          Explore specialized engineering tracks and access your course sessions
          & resources
        </p>
      </header>

      {/* Accordion Tracks List */}
      <div className='tracks-list'>
        {tracks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            No learning tracks available at the moment.
          </p>
        ) : (
          tracks.map((track) => {
            const isOpen = expandedTrackId === track._id
            const coursesCount = track.courses?.length || 0

            return (
              <div
                key={track._id}
                className={`track-card ${isOpen ? 'open' : ''}`}
              >
                {/* Track Card Header */}
                <div
                  className='track-card-header'
                  onClick={() => toggleTrack(track._id)}
                >
                  <div className='track-info-main'>
                    <div className='track-icon-wrapper'>
                      {track.icon || '🚀'}
                    </div>
                    <div className='track-meta'>
                      <h2>{track.name}</h2>
                      <p>{track.description}</p>
                    </div>
                  </div>

                  <div className='track-action-side'>
                    <span className='courses-count-badge'>
                      {coursesCount} {coursesCount === 1 ? 'Course' : 'Courses'}
                    </span>
                    <div className='toggle-arrow'>▼</div>
                  </div>
                </div>

                {/* Courses List (Appears when expanded) */}
                {isOpen && (
                  <div className='courses-container'>
                    {track.courses && track.courses.length > 0 ? (
                      <div className='courses-grid'>
                        {track.courses.map((course) => (
                          <div
                            key={course._id}
                            className='course-card-item'
                            onClick={(e) => handleCourseClick(course._id, e)}
                          >
                            <div className='course-card-info'>
                              <span>📚 {course.title}</span>
                            </div>
                            <span className='course-arrow'>→</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='empty-courses'>
                        No courses available in this track yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default TracksPage
