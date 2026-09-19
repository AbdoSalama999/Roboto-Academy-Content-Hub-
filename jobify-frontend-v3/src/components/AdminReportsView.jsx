import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/AdminReportsView.css'

const emptyStudent = () => ({
  name: '',
  technical: 5,
  programming: 5,
  attention: 5,
  behavior: 5,
})

const emptySession = () => ({
  technology: '',
  sessionName: '',
  students: [emptyStudent()],
})

const AdminReportsView = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // ✏️ حالة التعديل
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5555/api'

  const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  const fetchReports = async (date = selectedDate, name = nameFilter) => {
    setLoading(true)
    setErrorMessage('')
    try {
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      if (name) params.append('name', name)

      const url = `${API_BASE_URL}/daily-reports${
        params.toString() ? `?${params.toString()}` : ''
      }`

      const response = await axios.get(url, getAuthHeader())

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
    fetchReports('', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDateChange = (e) => {
    const dateValue = e.target.value
    setSelectedDate(dateValue)
    fetchReports(dateValue, nameFilter)
  }

  const handleNameFilterChange = (e) => {
    const value = e.target.value
    setNameFilter(value)
    fetchReports(selectedDate, value)
  }

  const handleClearFilter = () => {
    setSelectedDate('')
    setNameFilter('')
    fetchReports('', '')
  }

  // 🗑️ حذف تقرير
  const handleDelete = async (reportId) => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this report?',
    )
    if (!confirmed) return

    try {
      await axios.delete(`${API_BASE_URL}/daily-reports/${reportId}`, getAuthHeader())
      setReports((prev) => prev.filter((r) => r._id !== reportId))
    } catch (error) {
      console.error('Error deleting report:', error)
      alert(error.response?.data?.message || 'Failed to delete report.')
    }
  }

  // ✏️ بدء التعديل
  const startEditing = (report) => {
    setEditingId(report._id)
    setEditDraft({
      instructorName: report.instructorName || '',
      day: report.day || '',
      date: report.date
        ? new Date(report.date).toISOString().split('T')[0]
        : '',
      sessions: (report.sessions || []).map((s) => ({
        technology: s.technology || '',
        sessionName: s.sessionName || '',
        students: (s.students || []).map((st) => ({
          name: st.name || '',
          technical: st.technical ?? 5,
          programming: st.programming ?? 5,
          attention: st.attention ?? 5,
          behavior: st.behavior ?? 5,
        })),
      })),
      tasks: {
        attendingMeetings: !!report.tasks?.attendingMeetings,
        testingNewStudents: !!report.tasks?.testingNewStudents,
        preparingForSession: !!report.tasks?.preparingForSession,
        takingVideos: !!report.tasks?.takingVideos,
      },
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditDraft(null)
  }

  const updateDraftSession = (sIdx, field, value) => {
    setEditDraft((prev) => {
      const sessions = [...prev.sessions]
      sessions[sIdx] = { ...sessions[sIdx], [field]: value }
      return { ...prev, sessions }
    })
  }

  const updateDraftStudent = (sIdx, stIdx, field, value) => {
    setEditDraft((prev) => {
      const sessions = [...prev.sessions]
      const students = [...sessions[sIdx].students]
      students[stIdx] = { ...students[stIdx], [field]: value }
      sessions[sIdx] = { ...sessions[sIdx], students }
      return { ...prev, sessions }
    })
  }

  const addDraftStudent = (sIdx) => {
    setEditDraft((prev) => {
      const sessions = [...prev.sessions]
      sessions[sIdx] = {
        ...sessions[sIdx],
        students: [...sessions[sIdx].students, emptyStudent()],
      }
      return { ...prev, sessions }
    })
  }

  const removeDraftStudent = (sIdx, stIdx) => {
    setEditDraft((prev) => {
      const sessions = [...prev.sessions]
      const students = sessions[sIdx].students.filter((_, i) => i !== stIdx)
      sessions[sIdx] = { ...sessions[sIdx], students }
      return { ...prev, sessions }
    })
  }

  const addDraftSession = () => {
    setEditDraft((prev) => ({
      ...prev,
      sessions: [...prev.sessions, emptySession()],
    }))
  }

  const removeDraftSession = (sIdx) => {
    setEditDraft((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== sIdx),
    }))
  }

  // 💾 حفظ التعديل
  const saveEditing = async (reportId) => {
    setSavingEdit(true)
    try {
      const payload = {
        ...editDraft,
        sessions: editDraft.sessions.map((s) => ({
          ...s,
          studentCount: s.students.length,
        })),
      }

      const res = await axios.put(
        `${API_BASE_URL}/daily-reports/${reportId}`,
        payload,
        getAuthHeader(),
      )

      if (res.data.success) {
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? res.data.data : r)),
        )
        cancelEditing()
      }
    } catch (error) {
      console.error('Error updating report:', error)
      alert(error.response?.data?.message || 'Failed to update report.')
    } finally {
      setSavingEdit(false)
    }
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
        <div className='filter-field'>
          <label>👤 Instructor Name:</label>
          <input
            type='text'
            placeholder='Search by name...'
            value={nameFilter}
            onChange={handleNameFilterChange}
            className='input name-filter-input'
          />
        </div>

        <div className='filter-field'>
          <label>📅 Date:</label>
          <input
            type='date'
            value={selectedDate}
            onChange={handleDateChange}
            className='input date-filter-input'
          />
        </div>

        {(selectedDate || nameFilter) && (
          <button onClick={handleClearFilter} className='btn btn-coral'>
            Clear Filters ✖
          </button>
        )}
      </div>

      {errorMessage && <div className='banner banner-error'>{errorMessage}</div>}

      {loading ? (
        <div className='reports-status'>⏳ Loading reports...</div>
      ) : reports.length === 0 && !errorMessage ? (
        <div className='card reports-empty'>
          <p>No reports found matching your filters.</p>
        </div>
      ) : (
        <div className='reports-list'>
          {reports.map((report) => {
            const isEditing = editingId === report._id

            return (
              <div key={report._id} className='card report-card'>
                <div className='report-card-head'>
                  <div>
                    {isEditing ? (
                      <input
                        className='input edit-instructor-input'
                        value={editDraft.instructorName}
                        onChange={(e) =>
                          setEditDraft((p) => ({
                            ...p,
                            instructorName: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <h3>👨‍🏫 {report.instructorName}</h3>
                    )}
                    <span className='report-day'>Day: {report.day || 'N/A'}</span>
                  </div>

                  <div className='report-card-actions'>
                    <div className='badge badge-blue report-date-badge'>
                      📅{' '}
                      {new Date(
                        report.date || report.createdAt,
                      ).toLocaleDateString()}
                    </div>

                    {!isEditing ? (
                      <>
                        <button
                          className='btn btn-ghost edit-btn'
                          onClick={() => startEditing(report)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className='btn btn-danger-ghost delete-btn'
                          onClick={() => handleDelete(report._id)}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className='btn btn-emerald save-btn'
                          disabled={savingEdit}
                          onClick={() => saveEditing(report._id)}
                        >
                          {savingEdit ? 'Saving...' : '💾 Save'}
                        </button>
                        <button
                          className='btn btn-ghost cancel-btn'
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className='edit-form'>
                    {editDraft.sessions.map((session, sIdx) => (
                      <div key={sIdx} className='edit-session-block'>
                        <div className='edit-session-head'>
                          <input
                            className='input'
                            placeholder='Technology'
                            value={session.technology}
                            onChange={(e) =>
                              updateDraftSession(
                                sIdx,
                                'technology',
                                e.target.value,
                              )
                            }
                          />
                          <input
                            className='input'
                            placeholder='Session Name'
                            value={session.sessionName}
                            onChange={(e) =>
                              updateDraftSession(
                                sIdx,
                                'sessionName',
                                e.target.value,
                              )
                            }
                          />
                          {editDraft.sessions.length > 1 && (
                            <button
                              type='button'
                              className='btn btn-danger-ghost'
                              onClick={() => removeDraftSession(sIdx)}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {session.students.map((st, stIdx) => (
                          <div key={stIdx} className='edit-student-row'>
                            <input
                              className='input edit-student-name'
                              placeholder='Student Name'
                              value={st.name}
                              onChange={(e) =>
                                updateDraftStudent(
                                  sIdx,
                                  stIdx,
                                  'name',
                                  e.target.value,
                                )
                              }
                            />
                            <div className='edit-rating-grid'>
                              {['technical', 'programming', 'attention', 'behavior'].map(
                                (field) => (
                                  <input
                                    key={field}
                                    type='number'
                                    min='1'
                                    max='5'
                                    title={field}
                                    className='input edit-rating-input'
                                    value={st[field]}
                                    onChange={(e) =>
                                      updateDraftStudent(
                                        sIdx,
                                        stIdx,
                                        field,
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                ),
                              )}
                            </div>
                            {session.students.length > 1 && (
                              <button
                                type='button'
                                className='btn btn-danger-ghost'
                                onClick={() => removeDraftStudent(sIdx, stIdx)}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type='button'
                          className='btn btn-ghost add-student-btn'
                          onClick={() => addDraftStudent(sIdx)}
                        >
                          + Add Student
                        </button>
                      </div>
                    ))}

                    <button
                      type='button'
                      className='btn btn-emerald add-session-btn'
                      onClick={addDraftSession}
                    >
                      + Add Session
                    </button>
                  </div>
                ) : (
                  <>
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
                            <span className='badge badge-emerald'>
                              ✔ Meetings
                            </span>
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
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminReportsView
