import React, { useEffect, useState,useCallback } from 'react';
import api from '../api/axios';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', course: '', teacher: '', schedule: '', startDate: '', endDate: '', status: 'upcoming' });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
  try {
    const [batchesRes, coursesRes, teachersRes] = await Promise.all([
      api.get('/batches'),
      api.get('/courses'),
      api.get('/teachers'),
    ]);

    setBatches(batchesRes.data);
    setCourses(coursesRes.data);
    setTeachers(teachersRes.data);
  } catch (err) {
    console.error(err);
  }
}, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', course: '', teacher: '', schedule: '', startDate: '', endDate: '', status: 'upcoming' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      name: b.name,
      course: b.course?._id || '',
      teacher: b.teacher?._id || '',
      schedule: b.schedule || '',
      startDate: b.startDate ? b.startDate.slice(0, 10) : '',
      endDate: b.endDate ? b.endDate.slice(0, 10) : '',
      status: b.status,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/batches/${editing._id}`, form);
      } else {
        await api.post('/batches', form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch?')) return;
    await api.delete(`/batches/${id}`);
    load();
  };

  return (
    <div>
      <div className="topbar">
        <h1>Batch Management</h1>
        <button className="btn" onClick={openAdd}>+ Add Batch</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Name</th><th>Course</th><th>Teacher</th><th>Schedule</th><th>Students</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b._id}>
                <td>{b.name}</td>
                <td>{b.course?.name || '-'}</td>
                <td>{b.teacher?.teacherId || '-'}</td>
                <td>{b.schedule || '-'}</td>
                <td>{b.students?.length || 0}</td>
                <td><span className={`badge ${b.status === 'ongoing' ? 'active' : b.status === 'completed' ? 'inactive' : 'upcoming'}`}>{b.status}</span></td>
                <td>
                  <button className="btn outline" style={{ padding: '5px 10px', marginRight: 6 }} onClick={() => openEdit(b)}>Edit</button>
                  <button className="btn danger" style={{ padding: '5px 10px' }} onClick={() => handleDelete(b._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {batches.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>No batches found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit Batch' : 'Add Batch'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Batch Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Course</label>
                <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required>
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Teacher</label>
                <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
                  <option value="">-- Select Teacher --</option>
                  {teachers.map((t) => <option key={t._id} value={t._id}>{t.user?.name} ({t.teacherId})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Schedule</label>
                <input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Mon-Fri 10AM-12PM" />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex-between" style={{ marginTop: 16 }}>
                <button type="button" className="btn outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">{editing ? 'Update' : 'Add'} Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
