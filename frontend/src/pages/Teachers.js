import React, { useEffect, useState,useCallback} from 'react';
import api from '../api/axios';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', subjects: '', phone: '', qualification: '', salary: '' });
  const [error, setError] = useState('');

 const load = useCallback(async () => {
  try {
    const res = await api.get('/teachers');
    setTeachers(res.data);
  } catch (err) {
    console.error(err);
  }
}, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', subjects: '', phone: '', qualification: '', salary: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.user?.name || '',
      email: t.user?.email || '',
      password: '',
      subjects: (t.subjects || []).join(', '),
      phone: t.phone || '',
      qualification: t.qualification || '',
      salary: t.salary || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean) };
    try {
      if (editing) {
        await api.put(`/teachers/${editing._id}`, payload);
      } else {
        await api.post('/teachers', payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    await api.delete(`/teachers/${id}`);
    load();
  };

  return (
    <div>
      <div className="topbar">
        <h1>Teacher Management</h1>
        <button className="btn" onClick={openAdd}>+ Add Teacher</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Teacher ID</th><th>Name</th><th>Email</th><th>Subjects</th><th>Phone</th><th>Salary</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t._id}>
                <td>{t.teacherId}</td>
                <td>{t.user?.name}</td>
                <td>{t.user?.email}</td>
                <td>{(t.subjects || []).join(', ') || '-'}</td>
                <td>{t.phone || '-'}</td>
                <td>₹{t.salary || 0}</td>
                <td>
                  <button className="btn outline" style={{ padding: '5px 10px', marginRight: 6 }} onClick={() => openEdit(t)}>Edit</button>
                  <button className="btn danger" style={{ padding: '5px 10px' }} onClick={() => handleDelete(t._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>No teachers found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit Teacher' : 'Add Teacher'}</h3>
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
                  <label>Password (default: teacher123)</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="teacher123" />
                </div>
              )}
              <div className="form-group">
                <label>Subjects (comma separated)</label>
                <input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} placeholder="Math, Physics" />
              </div>
              <div className="form-group">
                <label>Qualification</label>
                <input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Salary</label>
                <input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex-between" style={{ marginTop: 16 }}>
                <button type="button" className="btn outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">{editing ? 'Update' : 'Add'} Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
