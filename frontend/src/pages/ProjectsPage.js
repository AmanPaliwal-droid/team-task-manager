import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';

const EMOJIS = ['📁', '🚀', '💡', '🎯', '🛠️', '📊', '🎨', '🔥', '⚡', '🌱'];
const COLORS = ['#7c6ef7', '#3ecf8e', '#f5a623', '#f06292', '#60a5fa', '#fb923c', '#a78bfa', '#34d399'];

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', emoji: '📁', color: '#7c6ef7' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Project name is required.');
    setSaving(true);
    setError('');
    try {
      await createProject(form);
      setShowModal(false);
      setForm({ name: '', description: '', emoji: '📁', color: '#7c6ef7' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await deleteProject(id);
    } catch {
      alert('Failed to delete project.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>Projects</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 2 }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New project</button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text3)' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <p style={{ color: 'var(--text2)', marginBottom: 16 }}>No projects yet. Create your first one!</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ New project</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 24 }}>
        {projects.map((p) => {
          const isAdmin = p.admin?._id === user?._id || p.admin === user?._id;
          const pct = p.taskCount ? Math.round((p.doneCount / p.taskCount) * 100) : 0;
          return (
            <Link
              to={`/projects/${p._id}`}
              key={p._id}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 22px',
                transition: 'border-color 0.15s',
                cursor: 'pointer',
                position: 'relative',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(p._id, e)}
                    style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text3)', fontSize: 16, padding: 4,
                      borderRadius: 6, lineHeight: 1,
                    }}
                    title="Delete project"
                  >×</button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${p.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>{p.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    {isAdmin && (
                      <span style={{ fontSize: 10, color: p.color, fontWeight: 500, letterSpacing: '0.05em' }}>ADMIN</span>
                    )}
                  </div>
                </div>

                {p.description && (
                  <p style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 14, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {p.description}
                  </p>
                )}

                <div style={{ marginBottom: 10 }}>
                  <div className="prog-bar">
                    <div className="prog-fill" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                    <span>{pct}% complete</span>
                    <span>{p.doneCount}/{p.taskCount} tasks</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
                  {p.members?.slice(0, 5).map((m) => (
                    <div key={m.user?._id || m.user} title={m.user?.name} style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: `${m.user?.color || '#7c6ef7'}22`,
                      color: m.user?.color || '#7c6ef7',
                      fontSize: 9, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid var(--bg)',
                    }}>
                      {m.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  ))}
                  {p.members?.length > 5 && (
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 4 }}>+{p.members.length - 5}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 28, width: 440, maxWidth: '90vw',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20 }}>New project</h3>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Website Redesign"
                  maxLength={60}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea
                  className="input"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What is this project about?"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 8 }}>Icon</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {EMOJIS.map(e => (
                    <button
                      key={e} type="button"
                      onClick={() => setForm(f => ({ ...f, emoji: e }))}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: `2px solid ${form.emoji === e ? 'var(--accent)' : 'var(--border)'}`,
                        background: form.emoji === e ? 'var(--accent-bg)' : 'var(--surface2)',
                        cursor: 'pointer', fontSize: 16,
                      }}
                    >{e}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 8 }}>Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', background: c,
                        border: `3px solid ${form.color === c ? 'var(--text)' : 'transparent'}`,
                        cursor: 'pointer', padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
