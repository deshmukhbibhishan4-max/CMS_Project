import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Attendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/batches').then((res) => setBatches(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      return;
    }
    api.get(`/batches/${selectedBatch}`).then((res) => {
      setStudents(res.data.students || []);
      const initial = {};
      (res.data.students || []).forEach((s) => { initial[s._id] = 'present'; });
      setRecords(initial);
    });
    api.get(`/attendance/batch/${selectedBatch}`).then((res) => setHistory(res.data)).catch(() => {});
  }, [selectedBatch]);

  const handleSubmit = async () => {
    setMessage('');
    try {
      const payload = {
        batch: selectedBatch,
        date,
        records: Object.entries(records).map(([student, status]) => ({ student, status })),
      };
      await api.post('/attendance', payload);
      setMessage('Attendance saved successfully!');
      api.get(`/attendance/batch/${selectedBatch}`).then((res) => setHistory(res.data)).catch(() => {});
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save attendance');
    }
  };

  return (
    <div>
      <div className="topbar">
        <h1>Attendance Management</h1>
      </div>

      <div className="card">
        <div className="form-group">
          <label>Select Batch</label>
          <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
            <option value="">-- Select Batch --</option>
            {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {students.length > 0 && (
          <>
            <table>
              <thead><tr><th>Student ID</th><th>Name</th><th>Status</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.studentId}</td>
                    <td>{s.user?.name}</td>
                    <td>
                      <select value={records[s._id] || 'present'} onChange={(e) => setRecords({ ...records, [s._id]: e.target.value })}>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn" style={{ marginTop: 14 }} onClick={handleSubmit}>Save Attendance</button>
            {message && <p style={{ marginTop: 10, color: message.includes('success') ? '#16a34a' : '#dc2626' }}>{message}</p>}
          </>
        )}
        {selectedBatch && students.length === 0 && <p style={{ color: '#6b7280' }}>No students assigned to this batch yet.</p>}
      </div>

      {history.length > 0 && (
        <div className="card">
          <h3>Attendance History</h3>
          <table>
            <thead><tr><th>Date</th><th>Present</th><th>Absent</th><th>Late</th><th>Total</th></tr></thead>
            <tbody>
              {history.map((h) => {
                const present = h.records.filter((r) => r.status === 'present').length;
                const absent = h.records.filter((r) => r.status === 'absent').length;
                const late = h.records.filter((r) => r.status === 'late').length;
                return (
                  <tr key={h._id}>
                    <td>{new Date(h.date).toLocaleDateString()}</td>
                    <td>{present}</td>
                    <td>{absent}</td>
                    <td>{late}</td>
                    <td>{h.records.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
