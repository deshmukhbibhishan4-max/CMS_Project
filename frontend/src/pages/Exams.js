import React, { useEffect, useState,useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Exams() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ name: '', course: '', batch: '', examDate: '', totalMarks: 100, passingMarks: 40 });

  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [marksForm, setMarksForm] = useState({});
  // const [myResults, setMyResults] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
  api.get('/exams')
    .then((res) => setExams(res.data))
    .catch(() => {});

  api.get('/courses')
    .then((res) => setCourses(res.data))
    .catch(() => {});

  api.get('/batches')
    .then((res) => setBatches(res.data))
    .catch(() => {});
}, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (user.role === 'student') {
      api.get(`/exams/results/student/${user._id}`).catch(() => {});
    }
  }, [user]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/exams', examForm);
      setShowExamModal(false);
      setExamForm({ name: '', course: '', batch: '', examDate: '', totalMarks: 100, passingMarks: 40 });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    }
  };

  const openExam = async (exam) => {
    setSelectedExam(exam);
    const resultRes = await api.get(`/exams/${exam._id}/results`);
    setResults(resultRes.data);
    const batchRes = await api.get(`/batches/${exam.batch._id || exam.batch}`);
    setBatchStudents(batchRes.data.students || []);
    const marks = {};
    resultRes.data.forEach((r) => { marks[r.student._id] = r.marksObtained; });
    setMarksForm(marks);
  };

  const handleSaveMarks = async (studentId) => {
    const marksObtained = marksForm[studentId];
    if (marksObtained === undefined || marksObtained === '') return;
    await api.post(`/exams/${selectedExam._id}/results`, { student: studentId, marksObtained: Number(marksObtained) });
    const resultRes = await api.get(`/exams/${selectedExam._id}/results`);
    setResults(resultRes.data);
  };

  return (
    <div>
      <div className="topbar">
        <h1>Examination Management</h1>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <button className="btn" onClick={() => { setShowExamModal(true); setError(''); }}>+ Create Exam</button>
        )}
      </div>

      <div className="card">
        <table>
          <thead><tr><th>Exam Name</th><th>Course</th><th>Batch</th><th>Date</th><th>Total Marks</th><th>Actions</th></tr></thead>
          <tbody>
            {exams.map((ex) => (
              <tr key={ex._id}>
                <td>{ex.name}</td>
                <td>{ex.course?.name || '-'}</td>
                <td>{ex.batch?.name || '-'}</td>
                <td>{new Date(ex.examDate).toLocaleDateString()}</td>
                <td>{ex.totalMarks}</td>
                <td><button className="btn outline" style={{ padding: '5px 10px' }} onClick={() => openExam(ex)}>View Results</button></td>
              </tr>
            ))}
            {exams.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>No exams found</td></tr>}
          </tbody>
        </table>
      </div>

      {selectedExam && (
        <div className="card">
          <div className="flex-between">
            <h3>{selectedExam.name} — Rank List & Marks</h3>
            <button className="btn outline" onClick={() => setSelectedExam(null)}>Close</button>
          </div>
          <table>
            <thead><tr><th>Student</th><th>Marks</th><th>Grade</th><th>Status</th>{(user.role !== 'student') && <th>Action</th>}</tr></thead>
            <tbody>
              {batchStudents.map((s) => {
                const result = results.find((r) => r.student._id === s._id);
                return (
                  <tr key={s._id}>
                    <td>{s.user?.name || s.studentId}</td>
                    <td>
                      {user.role === 'student' ? (result?.marksObtained ?? '-') : (
                        <input
                          type="number"
                          style={{ width: 70, padding: 4 }}
                          value={marksForm[s._id] ?? ''}
                          onChange={(e) => setMarksForm({ ...marksForm, [s._id]: e.target.value })}
                        />
                      )}
                    </td>
                    <td>{result?.grade || '-'}</td>
                    <td>{result ? <span className={`badge ${result.status}`}>{result.status}</span> : '-'}</td>
                    {(user.role !== 'student') && (
                      <td><button className="btn secondary" style={{ padding: '4px 10px' }} onClick={() => handleSaveMarks(s._id)}>Save</button></td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showExamModal && (
        <div className="modal-overlay" onClick={() => setShowExamModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Exam</h3>
            <form onSubmit={handleCreateExam}>
              <div className="form-group">
                <label>Exam Name</label>
                <input value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Course</label>
                <select value={examForm.course} onChange={(e) => setExamForm({ ...examForm, course: e.target.value })} required>
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Batch</label>
                <select value={examForm.batch} onChange={(e) => setExamForm({ ...examForm, batch: e.target.value })} required>
                  <option value="">-- Select Batch --</option>
                  {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Exam Date</label>
                <input type="date" value={examForm.examDate} onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Total Marks</label>
                <input type="number" value={examForm.totalMarks} onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Passing Marks</label>
                <input type="number" value={examForm.passingMarks} onChange={(e) => setExamForm({ ...examForm, passingMarks: e.target.value })} required />
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex-between" style={{ marginTop: 16 }}>
                <button type="button" className="btn outline" onClick={() => setShowExamModal(false)}>Cancel</button>
                <button type="submit" className="btn">Create Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
