import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/AdminReportsView.css'

const AdminReportsView = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5555/api'

  const fetchReports = async (date = '') => {
    setLoading(true)
    setErrorMessage('')
    try {
      const token = localStorage.getItem('token')
      const url = date
        ? `${API_BASE_URL}/daily-reports?date=${date}`
        : `${API_BASE_URL}/daily-reports`

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        setReports(response.data.data)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
      const msg =
        error.response?.data?.message || '🚨 حدث خطأ أثناء تحميل التقارير'
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleDateChange = (e) => {
    const dateValue = e.target.value
    setSelectedDate(dateValue)
    fetchReports(dateValue)
  }

  const handleClearFilter = () => {
    setSelectedDate('')
    fetchReports('')
  }

  return (
    <div className='page-shell admin-reports-view'>
      <div className='admin-reports-head'>
        <div>
          <span className='eyebrow'>📊 Admin</span>
          <h1>Daily Reports</h1>
        </div>
        <span className='total-reports-pill'>
          Total Reports: <strong>{reports.length}</strong>
        </span>
      </div>

      <div className='card date-filter-bar'>
        <label>📅 Filter by Date:</label>
        <input
          type='date'
          value={selectedDate}
          onChange={handleDateChange}
          className='input date-filter-input'
        />

        {selectedDate && (
          <button onClick={handleClearFilter} className='btn btn-coral'>
            Clear Filter ✖
          </button>
        )}
      </div>

      {errorMessage && <div className='banner banner-error'>{errorMessage}</div>}

      {loading ? (
        <div className='reports-status'>⏳ Loading reports...</div>
      ) : reports.length === 0 && !errorMessage ? (
        <div className='card reports-empty'>
          <p>
            No reports found {selectedDate && `for date: ${selectedDate}`}.
          </p>
        </div>
      ) : (
        <div className='reports-list'>
          {reports.map((report) => (
            <div key={report._id} className='card report-card'>
              <div className='report-card-head'>
                <div>
                  <h3>👨‍🏫 {report.instructorName}</h3>
                  <span className='report-day'>Day: {report.day || 'N/A'}</span>
                </div>
                <div className='badge badge-blue report-date-badge'>
                  📅{' '}
                  {new Date(
                    report.date || report.createdAt,
                  ).toLocaleDateString()}
                </div>
              </div>

              <h4 className='report-sessions-heading'>
                📌 Sessions Details ({report.sessions?.length || 0})
              </h4>

              {report.sessions?.map((session, sIdx) => (
                <div key={sIdx} className='report-session-block'>
                  <div className='report-session-title'>
                    Session {sIdx + 1}: {session.technology} -{' '}
                    {session.sessionName}
                    <span className='report-session-count'>
                      ({session.studentCount} Students)
                    </span>
                  </div>

                  {session.students && session.students.length > 0 && (
                    <div className='students-table-wrapper'>
                      <table className='students-table'>
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Tech</th>
                            <th>Prog</th>
                            <th>Attn</th>
                            <th>Behav</th>
                          </tr>
                        </thead>
                        <tbody>
                          {session.students.map((st, stIdx) => (
                            <tr key={stIdx}>
                              <td>{st.name}</td>
                              <td>{st.technical}/5</td>
                              <td>{st.programming}/5</td>
                              <td>{st.attention}/5</td>
                              <td>{st.behavior}/5</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}

              {report.tasks && (
                <div className='report-tasks-footer'>
                  <strong>✅ Completed Tasks:</strong>
                  <div className='report-tasks-pills'>
                    {report.tasks.attendingMeetings && (
                      <span className='badge badge-emerald'>✔ Meetings</span>
                    )}
                    {report.tasks.testingNewStudents && (
                      <span className='badge badge-emerald'>
                        ✔ Testing Students
                      </span>
                    )}
                    {report.tasks.preparingForSession && (
                      <span className='badge badge-emerald'>
                        ✔ Preparing Session
                      </span>
                    )}
                    {report.tasks.takingVideos && (
                      <span className='badge badge-emerald'>
                        ✔ Taking Videos
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminReportsView
