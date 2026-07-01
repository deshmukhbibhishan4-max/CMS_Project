import React, { useEffect, useState,useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', course: '', batch: '', phone: '', address: '' });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
  try {
    const [studentsRes, coursesRes, batchesRes] = await Promise.all([
      api.get('/students'),
      api.get('/courses'),
      api.get('/batches'),
    ]);

    setStudents(studentsRes.data);
    setCourses(coursesRes.data);
    setBatches(batchesRes.data);
  } catch (err) {
    console.error(err);
  }
}, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', course: '', batch: '', phone: '', address: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.user?.name || '',
      email: s.user?.email || '',
      password: '',
      course: s.course?._id || '',
      batch: s.batch?._id || '',
      phone: s.phone || '',
      address: s.address || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, form);
      } else {
        await api.post('/students', form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    await api.delete(`/students/${id}`);
    load();
  };

  const filtered = students.filter((s) =>
    (s.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.studentId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="topbar">
        <h1>Student Management</h1>
        {user.role === 'admin' && <button className="btn" onClick={openAdd}>+ Add Student</button>}
      </div>

      <div className="toolbar">
        <input placeholder="Search by name or student ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Status</th>
              {user.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s._id}>
                <td>{s.studentId}</td>
                <td>{s.user?.name}</td>
                <td>{s.user?.email}</td>
                <td>{s.course?.name || '-'}</td>
                <td>{s.batch?.name || '-'}</td>
                <td><span className={`badge ${s.status}`}>{s.status}</span></td>
                {user.role === 'admin' && (
                  <td>
                    <button className="btn outline" style={{ padding: '5px 10px', marginRight: 6 }} onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn danger" style={{ padding: '5px 10px' }} onClick={() => handleDelete(s._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit Student' : 'Add Student'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editing} />
              </div>
              {!editing && (
                <div className="form-group">
                  <label>Password (default: student123)</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="student123" />
                </div>
              )}
              <div className="form-group">
                <label>Course</label>
                <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Batch</label>
                <select value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}>
                  <option value="">-- Select Batch --</option>
                  {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex-between" style={{ marginTop: 16 }}>
                <button type="button" className="btn outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">{editing ? 'Update' : 'Add'} Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
