import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTracks } from '../services/api'
import '../styles/TrackPage.css'

function TracksPage() {
  const navigate = useNavigate()

  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // التراك المختار حالياً في السايد بار
  const [selectedTrackId, setSelectedTrackId] = useState(null)
  // نص البحث عن كورس داخل التراك المختار
  const [courseSearch, setCourseSearch] = useState('')

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`)
  }

  useEffect(() => {
    const fetchTracksData = async () => {
      try {
        setLoading(true)
        const responseData = await getTracks()
        const data = responseData.data || []
        setTracks(data)

        if (data.length > 0) {
          setSelectedTrackId(data[0]._id)
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

  const selectedTrack = useMemo(
    () => tracks.find((t) => t._id === selectedTrackId) || null,
    [tracks, selectedTrackId],
  )

  const filteredCourses = useMemo(() => {
    const courses = selectedTrack?.courses || []
    if (!courseSearch.trim()) return courses
    const q = courseSearch.trim().toLowerCase()
    return courses.filter((c) => c.title.toLowerCase().includes(q))
  }, [selectedTrack, courseSearch])

  if (loading) {
    return (
      <div className='tracks-status'>
        <h2>Loading tracks... ⏳</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className='tracks-status tracks-status-error'>
        <h2>{error}</h2>
      </div>
    )
  }

  return (
    <div className='page-shell'>
      <header className='page-header tracks-page-header'>
        <span className='eyebrow'>🎓 Learning Paths</span>
        <h1>Academy Tracks</h1>
        <p>
          Pick a track from the sidebar to browse its courses and jump
          straight into your session materials.
        </p>
      </header>

      <div className='tracks-layout'>
        {/* ===== Sidebar: Tracks list ===== */}
        <aside className='tracks-sidebar card'>
          <div className='tracks-sidebar-head'>Tracks ({tracks.length})</div>

          {tracks.length === 0 ? (
            <p className='tracks-empty-hint'>No learning tracks yet.</p>
          ) : (
            <nav className='track-nav-list'>
              {tracks.map((track) => {
                const isActive = track._id === selectedTrackId
                const coursesCount = track.courses?.length || 0
                return (
                  <button
                    key={track._id}
                    className={`track-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedTrackId(track._id)
                      setCourseSearch('')
                    }}
                  >
                    <span className='track-nav-icon'>
                      {track.icon || '🚀'}
                    </span>
                    <span className='track-nav-text'>
                      <span className='track-nav-name'>{track.name}</span>
                      <span className='track-nav-count'>
                        {coursesCount}{' '}
                        {coursesCount === 1 ? 'course' : 'courses'}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
          )}
        </aside>

        {/* ===== Main: Courses of selected track as cards ===== */}
        <section className='tracks-content'>
          {selectedTrack ? (
            <>
              <div className='tracks-content-head'>
                <div>
                  <h2>
                    {selectedTrack.icon || '🚀'} {selectedTrack.name}
                  </h2>
                  {selectedTrack.description && (
                    <p className='track-description'>
                      {selectedTrack.description}
                    </p>
                  )}
                </div>

                <div className='search-box course-search'>
                  <span className='search-icon'>🔍</span>
                  <input
                    type='text'
                    className='input'
                    placeholder='Search courses in this track...'
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                  />
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <p className='tracks-empty-hint'>
                  {courseSearch
                    ? 'No courses match your search.'
                    : 'No courses available in this track yet.'}
                </p>
              ) : (
                <div className='courses-grid'>
                  {filteredCourses.map((course) => (
                    <button
                      key={course._id}
                      className='course-card card card--hoverable'
                      onClick={() => handleCourseClick(course._id)}
                    >
                      <div className='course-card-icon'>📚</div>
                      <div className='course-card-title'>{course.title}</div>
                      <div className='course-card-cta'>
                        Open sessions <span>→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className='tracks-empty-hint'>
              No learning tracks available at the moment.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

export default TracksPage
