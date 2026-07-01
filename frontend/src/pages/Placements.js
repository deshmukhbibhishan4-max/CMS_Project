import React, { useEffect, useState ,useCallback} from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Placements() {
  const { user } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student: '', companyName: '', role: '', package: '', interviewDate: '', status: 'applied' });
  const [error, setError] = useState('');

 const load = useCallback(() => {
  api.get('/placements')
    .then((res) => setPlacements(res.data))
    .catch(() => {});

  api.get('/placements/stats')
    .then((res) => setStats(res.data))
    .catch(() => {});

  if (user.role === 'admin') {
    api.get('/students')
      .then((res) => setStudents(res.data))
      .catch(() => {});
  }
}, [user.role]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  load();
}, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/placements', form);
      setShowModal(false);
      setForm({ student: '', companyName: '', role: '', package: '', interviewDate: '', status: 'applied' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add record');
    }
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/placements/${id}`, { status });
    load();
  };

  return (
    <div>
      <div className="topbar">
        <h1>Placement Management</h1>
        {user.role === 'admin' && <button className="btn" onClick={() => { setShowModal(true); setError(''); }}>+ Add Record</button>}
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card"><div className="label">Total Applied</div><div className="value">{stats.totalApplied}</div></div>
          <div className="stat-card" style={{ borderLeftColor: '#16a34a' }}><div className="label">Total Selected</div><div className="value">{stats.totalSelected}</div></div>
          <div className="stat-card" style={{ borderLeftColor: '#06b6d4' }}><div className="label">Avg Package</div><div className="value">₹{stats.avgPackage}</div></div>
          <div className="stat-card" style={{ borderLeftColor: '#d97706' }}><div className="label">Highest Package</div><div className="value">₹{stats.highestPackage}</div></div>
        </div>
      )}

      <div className="card">
        <table>
          <thead><tr><th>Student</th><th>Company</th><th>Role</th><th>Package</th><th>Interview Date</th><th>Status</th></tr></thead>
          <tbody>
            {placements.map((p) => (
              <tr key={p._id}>
                <td>{p.student?.user?.name || '-'}</td>
                <td>{p.companyName}</td>
                <td>{p.role}</td>
                <td>₹{p.package}</td>
                <td>{p.interviewDate ? new Date(p.interviewDate).toLocaleDateString() : '-'}</td>
                <td>
                  {user.role === 'admin' ? (
                    <select value={p.status} onChange={(e) => handleStatusChange(p._id, e.target.value)}>
                      <option value="applied">Applied</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  ) : (
                    <span className={`badge ${p.status === 'selected' ? 'active' : p.status === 'rejected' ? 'inactive' : 'pending'}`}>{p.status.replace('_', ' ')}</span>
                  )}
                </td>
              </tr>
            ))}
            {placements.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>No placement records found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Placement Record</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Student</label>
                <select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
                  <option value="">-- Select Student --</option>
                  {students.map((s) => <option key={s._id} value={s._id}>{s.user?.name} ({s.studentId})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Package (Annual CTC)</label>
                <input type="number" value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Interview Date</label>
                <input type="date" value={form.interviewDate} onChange={(e) => setForm({ ...form, interviewDate: e.target.value })} />
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex-between" style={{ marginTop: 16 }}>
                <button type="button" className="btn outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
