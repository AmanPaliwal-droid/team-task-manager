import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import api from '../utils/api';

function initials(name) {
  return name?.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) || '??';
}

export default function MembersPage() {
  const { user } = useAuth();
  const { projects, fetchProjects, addMember, removeMember } = useProjects();
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProjects().finally(() => setLoading(false));
  }, [fetchProjects]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Keep selectedProject in sync with updated projects list
  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find((p) => p._id === selectedProject._id);
      if (updated) setSelectedProject(updated);
    }
  }, [projects]); // eslint-disable-line

  const isAdmin = selectedProject?.admin?._id === user?._id || selectedProject?.admin === user?._id;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);
    try {
      const res = await api.get(`/auth/search?email=${encodeURIComponent(searchEmail.trim())}`);
      setSearchResult(res.data.user);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'User not found.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!searchResult || !selectedProject) return;
    setActionLoading(true);
    try {
      await addMember(selectedProject._id, searchResult._id);
      setSearchResult(null);
      setSearchEmail('');
      setSearchError('');
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!selectedProject) return;
    if (!window.confirm('Remove this member from the project?')) return;
    setActionLoading(true);
    try {
      await removeMember(selectedProject._id, userId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>Team</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 2 }}>
            Manage members across your projects
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
          <p>No projects yet. Create a project to manage team members.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
          {/* Project list */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>
              Projects
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {projects.map((p) => (
                <button
                  key={p._id}
                  onClick={() => { setSelectedProject(p); setSearchResult(null); setSearchEmail(''); setSearchError(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 12px', borderRadius: 9, border: 'none',
                    background: selectedProject?._id === p._id ? 'var(--accent-bg)' : 'transparent',
                    color: selectedProject?._id === p._id ? 'var(--accent2)' : 'var(--text2)',
                    cursor: 'pointer', textAlign: 'left', fontSize: 13,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 15 }}>{p.emoji}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.6 }}>{p.members?.length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Member management panel */}
          {selectedProject && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: `${selectedProject.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>{selectedProject.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>{selectedProject.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {selectedProject.members?.length} member{selectedProject.members?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedProject.members?.map((m) => {
                    const memberUser = m.user;
                    const memberId = memberUser?._id || memberUser;
                    const memberName = memberUser?.name || 'Unknown';
                    const memberEmail = memberUser?.email || '';
                    const memberColor = memberUser?.color || '#7c6ef7';
                    const isProjectAdmin = selectedProject.admin?._id === memberId || selectedProject.admin === memberId;
                    const isSelf = memberId === user?._id;

                    return (
                      <div key={memberId} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 10,
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: `${memberColor}22`, color: memberColor,
                          fontWeight: 600, fontSize: 12,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {initials(memberName)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                            {memberName} {isSelf && <span style={{ fontSize: 10, color: 'var(--text3)' }}>(you)</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{memberEmail}</div>
                        </div>
                        <span className={`badge badge-${m.role}`} style={{ fontSize: 10 }}>{m.role}</span>
                        {isAdmin && !isProjectAdmin && !isSelf && (
                          <button
                            onClick={() => handleRemove(memberId)}
                            disabled={actionLoading}
                            style={{
                              background: 'var(--red-bg)', border: '1px solid rgba(240,98,146,0.2)',
                              color: 'var(--red)', borderRadius: 7, padding: '4px 10px',
                              cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font)',
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add member — admin only */}
              {isAdmin && (
                <div className="card">
                  <div style={{ fontWeight: 500, marginBottom: 14, fontSize: 14 }}>Add member</div>
                  <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                      className="input"
                      type="email"
                      placeholder="Search by email address"
                      value={searchEmail}
                      onChange={(e) => { setSearchEmail(e.target.value); setSearchResult(null); setSearchError(''); }}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={searchLoading || !searchEmail.trim()}
                      style={{ whiteSpace: 'nowrap', padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)', fontWeight: 500, background: 'var(--accent)', color: '#fff' }}
                    >
                      {searchLoading ? 'Searching…' : 'Search'}
                    </button>
                  </form>

                  {searchError && (
                    <div className="error-msg" style={{ marginBottom: 10 }}>{searchError}</div>
                  )}

                  {searchResult && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 10,
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `${searchResult.color || '#7c6ef7'}22`,
                        color: searchResult.color || '#7c6ef7',
                        fontWeight: 600, fontSize: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {initials(searchResult.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{searchResult.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{searchResult.email}</div>
                      </div>
                      {selectedProject.members?.some(m => (m.user?._id || m.user) === searchResult._id) ? (
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>Already a member</span>
                      ) : (
                        <button
                          onClick={handleAddMember}
                          disabled={actionLoading}
                          style={{
                            background: 'var(--accent)', border: 'none',
                            color: '#fff', borderRadius: 7, padding: '6px 14px',
                            cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font)',
                          }}
                        >
                          {actionLoading ? 'Adding…' : 'Add'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!isAdmin && (
                <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: 16 }}>
                  Only the project admin can add or remove members.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
