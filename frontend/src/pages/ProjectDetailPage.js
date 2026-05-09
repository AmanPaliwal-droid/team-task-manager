import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const PRIORITY_COLORS = { low: '#3ecf8e', medium: '#f5a623', high: '#f06292' };

function initials(name) {
  return name?.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) || '??';
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { fetchProject, currentProject, tasks, createTask, updateTask, deleteTask } = useProjects();

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProject(id).finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  const isAdmin = currentProject?.admin?._id === user?._id || currentProject?.admin === user?._id;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setFormError('Title is required.');
    setSaving(true);
    setFormError('');
    try {
      await createTask(id, { ...form, status: 'todo' });
      setForm({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try { await deleteTask(taskId); } catch (err) { alert('Failed to delete task.'); }
  };

  // Drag-and-drop handlers
  const onDragStart = (taskId) => setDraggedId(taskId);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = async (e, colKey) => {
    e.preventDefault();
    if (!draggedId) return;
    const task = tasks.find((t) => t._id === draggedId);
    if (task && task.status !== colKey) await handleStatusChange(draggedId, colKey);
    setDraggedId(null);
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--text3)' }}>Loading project…</div>;
  if (!currentProject) return <div style={{ padding: 40, color: 'var(--red)' }}>Project not found.</div>;

  const members = currentProject.members || [];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${currentProject.color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>{currentProject.emoji}</div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500 }}>
              {currentProject.name}
            </h1>
            {currentProject.description && (
              <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>{currentProject.description}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Member avatars */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {members.slice(0, 5).map((m) => (
              <div key={m.user?._id || m.user} title={m.user?.name} style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `${m.user?.color || '#7c6ef7'}22`,
                color: m.user?.color || '#7c6ef7',
                fontSize: 10, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg)', marginLeft: -6,
              }}>{initials(m.user?.name)}</div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add task</button>
        </div>
      </div>

      {/* Kanban board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.key)}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 12,
                minHeight: 400,
              }}
            >
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.04em' }}>
                  {col.label}
                </span>
                <span style={{
                  fontSize: 11, background: 'var(--border)', color: 'var(--text3)',
                  borderRadius: 20, padding: '1px 7px',
                }}>{colTasks.length}</span>
              </div>

              {/* Task cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={() => onDragStart(task._id)}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      cursor: 'grab',
                      opacity: draggedId === task._id ? 0.4 : 1,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0, flex: 1, lineHeight: 1.4 }}>
                        {task.title}
                      </p>
                      {(isAdmin || task.createdBy?._id === user?._id || task.createdBy === user?._id) && (
                        <button
                          onClick={() => handleDelete(task._id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1 }}
                          title="Delete task"
                        >×</button>
                      )}
                    </div>

                    {task.description && (
                      <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {task.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                        color: PRIORITY_COLORS[task.priority] || '#999',
                        textTransform: 'uppercase',
                      }}>{task.priority}</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {task.dueDate && (
                          <span style={{
                            fontSize: 10, color: new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'var(--red)' : 'var(--text3)',
                          }}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.assignee && (
                          <div title={task.assignee.name} style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: `${task.assignee.color || '#7c6ef7'}22`,
                            color: task.assignee.color || '#7c6ef7',
                            fontSize: 9, fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>{initials(task.assignee.name)}</div>
                        )}
                      </div>
                    </div>

                    {/* Quick status change (for non-drag users) */}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      style={{
                        marginTop: 8, width: '100%', fontSize: 11,
                        border: '1px solid var(--border)', borderRadius: 6,
                        padding: '3px 6px', background: 'var(--surface2)',
                        color: 'var(--text2)', cursor: 'pointer',
                        fontFamily: 'var(--font)',
                      }}
                    >
                      {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 12 }}>
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowForm(false)}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 28, width: 440, maxWidth: '90vw',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 20 }}>New task</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>Title *</label>
                <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task title" maxLength={150} autoFocus />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>Description</label>
                <textarea className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional details…" rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>Priority</label>
                  <select className="input" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>Due date</label>
                  <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 5 }}>Assign to</label>
                <select className="input" value={form.assignee} onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                      {m.user?.name || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
              {formError && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{formError}</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}