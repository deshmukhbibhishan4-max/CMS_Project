import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', duration: '', fees: '' });
  const [error, setError] = useState('');

 const load = useCallback(() => {
  api.get('/courses')
    .then((res) => setCourses(res.data))
    .catch(() => {});
}, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', code: '', description: '', duration: '', fees: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, code: c.code, description: c.description, duration: c.duration, fees: c.fees });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/courses/${editing._id}`, form);
      } else {
        await api.post('/courses', form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`);
    load();
  };

  return (
    <div>
      <div className="topbar">
        <h1>Course Management</h1>
        {user.role === 'admin' && <button className="btn" onClick={openAdd}>+ Add Course</button>}
      </div>

      <div className="stat-grid">
        {courses.map((c) => (
          <div className="card" key={c._id}>
            <div className="flex-between">
              <h3 style={{ margin: 0 }}>{c.name}</h3>
              <span className="badge active">{c.code}</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '8px 0' }}>{c.description || 'No description'}</p>
            <p style={{ fontSize: 13 }}><strong>Duration:</strong> {c.duration || '-'}</p>
            <p style={{ fontSize: 13 }}><strong>Fees:</strong> ₹{c.fees}</p>
            {user.role === 'admin' && (
              <div style={{ marginTop: 10 }}>
                <button className="btn outline" style={{ padding: '5px 10px', marginRight: 6 }} onClick={() => openEdit(c)}>Edit</button>
                <button className="btn danger" style={{ padding: '5px 10px' }} onClick={() => handleDelete(c._id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
        {courses.length === 0 && <p style={{ color: '#6b7280' }}>No courses found</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit Course' : 'Add Course'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Course Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required disabled={!!editing} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 6 months" />
              </div>
              <div className="form-group">
                <label>Fees</label>
                <input type="number" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} required />
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex-between" style={{ marginTop: 16 }}>
                <button type="button" className="btn outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">{editing ? 'Update' : 'Add'} Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
