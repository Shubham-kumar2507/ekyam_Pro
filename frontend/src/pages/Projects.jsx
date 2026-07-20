import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';

export default function Projects() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [joinProjectId, setJoinProjectId] = useState(null);
    const [joinReason, setJoinReason] = useState('');
    const [joinSubmitting, setJoinSubmitting] = useState(false);

    useEffect(() => {
        api.get('/projects').then(r => setProjects(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const filtered = projects.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleJoin = (id) => {
        setJoinProjectId(id);
        setJoinReason('');
    };

    const handleJoinSubmit = async () => {
        if (!joinReason.trim()) return;
        setJoinSubmitting(true);
        try {
            await api.post(`/projects/${joinProjectId}/join`, { reason: joinReason.trim() });
            setProjects(prev => prev.map(p => p._id === joinProjectId ? { ...p, members: [...(p.members || []), user._id] } : p));
            setJoinProjectId(null);
            setJoinReason('');
        } catch (_err) {
            alert(_err.response?.data?.message || 'Error');
        }
        setJoinSubmitting(false);
    };

    const statusColors = { active: { bg: '#d1fae5', text: '#065f46' }, planning: { bg: '#fef3c7', text: '#92400e' }, completed: { bg: '#e0e7ff', text: '#3730a3' }, in_progress: { bg: '#dbeafe', text: '#1e40af' }, on_hold: { bg: '#fce7f3', text: '#9d174d' } };
    const card = { background: theme.bgCard, borderRadius: '16px', overflow: 'hidden', boxShadow: theme.shadow, transition: 'transform 0.2s', border: `1px solid ${theme.border}` };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg }}>
            <div style={{ background: theme.heroBg, color: '#fff', padding: '3rem 1rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Discover Projects</h1>
                <p style={{ opacity: 0.85, fontSize: '1.05rem', marginBottom: '1.5rem' }}>Find collaborative projects and make an impact</p>
                <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '0.75rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
                            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', border: 'none', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', background: theme.bgInput, color: theme.text }} />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: 'none', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', minWidth: '140px', background: theme.bgInput, color: theme.text }}>
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <p style={{ color: theme.textMuted }}>{filtered.length} projects found</p>
                    {user && (
                        <Link to="/create-project" style={{ background: theme.accent, color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                            <i className="fas fa-plus" style={{ marginRight: '0.4rem' }}></i>Create Project
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: theme.accent }}></i></div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: theme.textFaint }}>
                        <i className="fas fa-project-diagram" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                        <p style={{ fontSize: '1.1rem' }}>No projects found.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {filtered.map(p => {
                            const sc = statusColors[p.status] || statusColors.active;
                            return (
                                <div key={p._id} style={card}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ height: '140px', background: 'linear-gradient(135deg, #312e81, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {p.image ? (
                                            <img src={getMediaUrl(p.image)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <i className="fas fa-project-diagram" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.2)' }}></i>
                                        )}
                                    </div>
                                    <div style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontWeight: '700', color: theme.text, fontSize: '1.1rem' }}>{p.name}</h3>
                                            <span style={{ background: sc.bg, color: sc.text, padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '600', flexShrink: 0 }}>{p.status || 'active'}</span>
                                        </div>
                                        <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.5' }} className="line-clamp-2">{p.description}</p>
                                        <div style={{ display: 'flex', gap: '1rem', color: theme.textFaint, fontSize: '0.8rem', marginBottom: '1rem' }}>
                                            <span><i className="fas fa-user-friends" style={{ marginRight: '0.3rem' }}></i>{p.members?.length || 0} members</span>
                                            <span><i className="fas fa-calendar" style={{ marginRight: '0.3rem' }}></i>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link to={`/projects/${p._id}`} style={{ flex: 1, textAlign: 'center', padding: '0.6rem', background: theme.accentLight, color: theme.accentText, borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                                                View Details
                                            </Link>
                                            {user && (
                                                <button onClick={() => handleJoin(p._id)}
                                                    style={{ flex: 1, padding: '0.6rem', background: theme.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                                                    Join
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Join Reason Modal */}
            {joinProjectId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                    onClick={() => setJoinProjectId(null)}>
                    <div style={{ background: theme.bgCard, borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ color: theme.text, fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.15rem' }}>
                            <i className="fas fa-paper-plane" style={{ color: theme.accent, marginRight: '0.5rem' }}></i>Request to Join
                        </h3>
                        <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '1rem' }}>Tell the project creator why you'd like to join.</p>
                        <textarea
                            value={joinReason}
                            onChange={e => setJoinReason(e.target.value)}
                            placeholder="Why do you want to join this project?"
                            rows={4}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text, fontSize: '0.95rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setJoinProjectId(null)}
                                style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.text, cursor: 'pointer', fontWeight: '600' }}>
                                Cancel
                            </button>
                            <button onClick={handleJoinSubmit} disabled={!joinReason.trim() || joinSubmitting}
                                style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: theme.accent, color: '#fff', cursor: 'pointer', fontWeight: '600', opacity: (!joinReason.trim() || joinSubmitting) ? 0.5 : 1 }}>
                                {joinSubmitting ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
