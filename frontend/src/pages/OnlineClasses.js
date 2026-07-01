import React, { useEffect, useState,useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PLATFORMS = ['zoom', 'google_meet', 'microsoft_teams', 'other'];
const STATUSES = ['scheduled', 'live', 'completed', 'cancelled'];
const STATUS_COLORS = {
  scheduled: '#4f46e5',
  live: '#16a34a',
  completed: '#6b7280',
  cancelled: '#dc2626',
};
const PLATFORM_ICONS = {
  zoom: '📹',
  google_meet: '🎥',
  microsoft_teams: '💼',
  other: '🌐',
};

const emptyForm = {
  title: '',
  description: '',
  course: '',
  batch: '',
  teacher: '',
  meetingLink: '',
  platform: 'zoom',
  scheduledAt: '',
  durationMinutes: 60,
  notes: '',
  status: 'scheduled',
  recordingLink: '',
};

export default function OnlineClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const canCreate = isAdmin || isTeacher;

  const fetchAll = useCallback(async () => {
  try {
    const [cRes, bRes] = await Promise.all([
      api.get('/courses'),
      api.get('/batches'),
    ]);

    setCourses(cRes.data);
    setBatches(bRes.data);

    if (isAdmin) {
      const tRes = await api.get('/teachers');
      setTeachers(tRes.data);
    }

    const ocRes = await api.get('/online-classes');
    setClasses(ocRes.data);
  } catch (e) {
    setError('Failed to load data');
  }
}, [isAdmin]);

 useEffect(() => {
  fetchAll();
}, [fetchAll]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (cls) => {
    setForm({
      title: cls.title,
      description: cls.description || '',
      course: cls.course?._id || '',
      batch: cls.batch?._id || '',
      teacher: cls.teacher?._id || '',
      meetingLink: cls.meetingLink,
      platform: cls.platform,
      scheduledAt: cls.scheduledAt ? cls.scheduledAt.slice(0, 16) : '',
      durationMinutes: cls.durationMinutes,
      notes: cls.notes || '',
      status: cls.status,
      recordingLink: cls.recordingLink || '',
    });
    setEditId(cls._id);
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (isTeacher) delete payload.teacher;
      if (editId) {
        await api.put(`/online-classes/${editId}`, payload);
      } else {
        await api.post('/online-classes', payload);
      }
      await fetchAll();
      setShowModal(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this online class?')) return;
    try {
      await api.delete(`/online-classes/${id}`);
      setClasses(classes.filter((c) => c._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = filterStatus ? classes.filter((c) => c.status === filterStatus) : classes;

  const formatDT = (dt) => {
    if (!dt) return '-';
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="topbar">
        <h1>🖥️ Online Classes</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
            ))}
          </select>
          {canCreate && (
            <button className="btn" onClick={openCreate}>+ Schedule Class</button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {STATUSES.map((s) => (
          <div key={s} className="card" style={{ flex: '1 1 160px', borderLeft: `4px solid ${STATUS_COLORS[s]}`, marginBottom: 0 }}>
            <div style={{ fontSize: 13, color: '#6b7280', textTransform: 'capitalize' }}>{s.replace('_', ' ')}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: STATUS_COLORS[s] }}>
              {classes.filter((c) => c.status === s).length}
            </div>
          </div>
        ))}
      </div>

      {/* Class Cards */}
      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>
          No online classes found. {canCreate && 'Schedule your first class!'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map((cls) => (
          <div key={cls._id} className="card" style={{ borderTop: `4px solid ${STATUS_COLORS[cls.status]}`, marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 18 }}>{PLATFORM_ICONS[cls.platform]}</span>
                <strong style={{ fontSize: 15, marginLeft: 6 }}>{cls.title}</strong>
              </div>
              <span style={{
                background: STATUS_COLORS[cls.status] + '22',
                color: STATUS_COLORS[cls.status],
                borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600
              }}>
                {cls.status === 'live' ? '🔴 LIVE' : cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
              </span>
            </div>

            {cls.description && <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 8px' }}>{cls.description}</p>}

            <div style={{ fontSize: 13, lineHeight: 2 }}>
              <div>📚 <strong>Course:</strong> {cls.course?.name || '-'}</div>
              {cls.batch && <div>👥 <strong>Batch:</strong> {cls.batch?.name}</div>}
              <div>👤 <strong>Teacher:</strong> {cls.teacher?.name || '-'}</div>
              <div>📅 <strong>Scheduled:</strong> {formatDT(cls.scheduledAt)}</div>
              <div>⏱️ <strong>Duration:</strong> {cls.durationMinutes} mins</div>
              {cls.platform && <div>🖥️ <strong>Platform:</strong> {cls.platform.replace('_', ' ')}</div>}
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a
                href={cls.meetingLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: cls.status === 'live' ? '#16a34a' : '#4f46e5',
                  color: '#fff', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                }}
              >
                {cls.status === 'live' ? '🔴 Join Now' : '🔗 Meeting Link'}
              </a>
              {cls.recordingLink && (
                <a
                  href={cls.recordingLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#f3f4f6', color: '#4f46e5', padding: '7px 14px',
                    borderRadius: 8, fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb',
                  }}
                >
                  🎬 Recording
                </a>
              )}
              {canCreate && (
                <>
                  <button className="btn outline" style={{ fontSize: 13, padding: '7px 12px' }} onClick={() => openEdit(cls)}>Edit</button>
                  {isAdmin && (
                    <button className="btn danger" style={{ fontSize: 13, padding: '7px 12px' }} onClick={() => handleDelete(cls._id)}>Delete</button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>{editId ? 'Edit Online Class' : 'Schedule Online Class'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>

            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Title *</label>
                  <input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. React Hooks Deep Dive" />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea className="input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What will be covered?" style={{ resize: 'vertical' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Course *</label>
                    <select className="input" required value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Batch</label>
                    <select className="input" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })}>
                      <option value="">All Batches</option>
                      {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Teacher *</label>
                    <select className="input" required value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })}>
                      <option value="">Select Teacher</option>
                      {teachers.map(t => <option key={t._id} value={t.user?._id || t._id}>{t.user?.name || t.name}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Meeting Link *</label>
                  <input className="input" required type="url" value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://zoom.us/j/..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Platform</label>
                    <select className="input" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                      {PLATFORMS.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Duration (mins)</label>
                    <input className="input" type="number" min={15} max={480} value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: +e.target.value })} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Scheduled Date & Time *</label>
                  <input className="input" required type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
                </div>

                {editId && (
                  <>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Status</label>
                      <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Recording Link</label>
                      <input className="input" type="url" value={form.recordingLink} onChange={e => setForm({ ...form, recordingLink: e.target.value })} placeholder="https://drive.google.com/..." />
                    </div>
                  </>
                )}

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Notes</label>
                  <textarea className="input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes for students..." style={{ resize: 'vertical' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button type="button" className="btn outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Class' : 'Schedule Class'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
