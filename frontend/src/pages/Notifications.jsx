import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';

/* ─── Notification type config ─── */
const TYPE_CONFIG = {
    join_request_community: { icon: 'fas fa-users', color: '#8b5cf6', label: 'Community Join Request' },
    join_request_project: { icon: 'fas fa-project-diagram', color: '#3b82f6', label: 'Project Join Request' },
    join_approved: { icon: 'fas fa-check-circle', color: '#10b981', label: 'Request Approved' },
    join_rejected: { icon: 'fas fa-times-circle', color: '#ef4444', label: 'Request Rejected' },
    resource_shared: { icon: 'fas fa-book', color: '#f59e0b', label: 'Resource Shared' },
    community_update: { icon: 'fas fa-bullhorn', color: '#6366f1', label: 'Community Update' },
    connection_request: { icon: 'fas fa-user-plus', color: '#ec4899', label: 'Connection Request' },
    connection_accepted: { icon: 'fas fa-handshake', color: '#10b981', label: 'Connection Accepted' },
    new_follower: { icon: 'fas fa-heart', color: '#f43f5e', label: 'New Follower' },
    post_created: { icon: 'fas fa-pen-fancy', color: '#14b8a6', label: 'New Post' },
    project_update: { icon: 'fas fa-tasks', color: '#3b82f6', label: 'Project Update' },
    general: { icon: 'fas fa-bell', color: '#6b7280', label: 'General' },
};

const FILTERS = [
    { key: 'all', label: 'All', icon: 'fas fa-layer-group' },
    { key: 'join', label: 'Join Requests', icon: 'fas fa-user-plus' },
    { key: 'network', label: 'Network', icon: 'fas fa-handshake' },
    { key: 'project', label: 'Projects', icon: 'fas fa-project-diagram' },
    { key: 'community', label: 'Communities', icon: 'fas fa-users' },
    { key: 'feed', label: 'Feed', icon: 'fas fa-rss' },
];

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function matchFilter(type, filterKey) {
    if (filterKey === 'all') return true;
    if (filterKey === 'join') return type.startsWith('join_');
    if (filterKey === 'network') return ['connection_request', 'connection_accepted', 'new_follower'].includes(type);
    if (filterKey === 'project') return ['join_request_project', 'project_update'].includes(type);
    if (filterKey === 'community') return ['join_request_community', 'community_update', 'resource_shared'].includes(type);
    if (filterKey === 'feed') return ['post_created'].includes(type);
    return true;
}

export default function Notifications() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchNotifications = async (p = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/notifications?page=${p}&limit=20`);
            setNotifications(data.notifications);
            setTotalPages(data.pages);
            setPage(p);
        } catch { /* silent */ }
        setLoading(false);
    };

    useEffect(() => { fetchNotifications(); }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`, {}, { skipLoader: true });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch { /* silent */ }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all', {}, { skipLoader: true });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch { /* silent */ }
    };

    const clearAll = async () => {
        if (!window.confirm('Delete all notifications?')) return;
        try {
            await api.delete('/notifications');
            setNotifications([]);
        } catch { /* silent */ }
    };

    const deleteOne = async (e, id) => {
        e.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch { /* silent */ }
    };

    const handleClick = (n) => {
        if (!n.read) markAsRead(n._id);
        if (n.link) navigate(n.link);
    };

    const filtered = notifications.filter(n => matchFilter(n.type, filter));
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={{ minHeight: '100vh', background: theme.bg }}>
            {/* Header */}
            <div style={{ background: theme.heroBg, color: '#fff', padding: '2.5rem 1rem 2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    <i className="fas fa-bell" style={{ marginRight: '0.6rem', opacity: 0.9 }}></i>Notifications
                </h1>
                <p style={{ opacity: 0.8, fontSize: '1rem' }}>
                    Stay updated with everything happening in your network
                </p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>

                {/* Actions bar */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem',
                }}>
                    <p style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'} · {filtered.length} notifications
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead}
                                style={{
                                    background: theme.accentLight, color: theme.accentText,
                                    border: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px',
                                    cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem',
                                    transition: 'opacity 0.15s',
                                }}>
                                <i className="fas fa-check-double" style={{ marginRight: '0.3rem' }}></i>Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button onClick={clearAll}
                                style={{
                                    background: theme.errorBg, color: theme.error,
                                    border: `1px solid ${theme.errorBorder}`, padding: '0.45rem 0.9rem',
                                    borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem',
                                }}>
                                <i className="fas fa-trash-alt" style={{ marginRight: '0.3rem' }}></i>Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div style={{
                    display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.5rem',
                    marginBottom: '1rem', scrollbarWidth: 'none',
                }}>
                    {FILTERS.map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
                                fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                background: filter === f.key ? theme.accent : theme.bgCard,
                                color: filter === f.key ? '#fff' : theme.textMuted,
                                boxShadow: filter === f.key ? `0 4px 12px ${theme.accent}40` : theme.shadow,
                                transition: 'all 0.2s ease',
                            }}>
                            <i className={f.icon} style={{ fontSize: '0.75rem' }}></i>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Notification list */}
                <div style={{
                    background: theme.bgCard, borderRadius: '16px',
                    border: `1px solid ${theme.border}`,
                    boxShadow: theme.shadow, overflow: 'hidden',
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: theme.accent }}></i>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: theme.textFaint }}>
                            <i className="fas fa-bell-slash" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', opacity: 0.35 }}></i>
                            <p style={{ fontWeight: '700', fontSize: '1.05rem', color: theme.textMuted, marginBottom: '0.3rem' }}>
                                No notifications
                            </p>
                            <p style={{ fontSize: '0.88rem' }}>
                                {filter !== 'all' ? 'Try a different filter' : 'You\'re all caught up!'}
                            </p>
                        </div>
                    ) : (
                        filtered.map(n => {
                            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
                            return (
                                <div key={n._id}
                                    onClick={() => handleClick(n)}
                                    style={{
                                        display: 'flex', gap: '1rem', alignItems: 'flex-start',
                                        padding: '1rem 1.25rem',
                                        cursor: n.link ? 'pointer' : 'default',
                                        background: n.read ? 'transparent' : (theme.name === 'dark' ? 'rgba(99,102,241,0.05)' : 'rgba(79,70,229,0.03)'),
                                        borderBottom: `1px solid ${theme.borderLight}`,
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = theme.bgCardHover}
                                    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : (theme.name === 'dark' ? 'rgba(99,102,241,0.05)' : 'rgba(79,70,229,0.03)')}
                                >
                                    {/* Icon */}
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        background: `${cfg.color}15`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <i className={cfg.icon} style={{ color: cfg.color, fontSize: '1rem' }}></i>
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <p style={{
                                                fontWeight: n.read ? '500' : '700', fontSize: '0.92rem',
                                                color: theme.text, margin: 0, lineHeight: 1.4,
                                            }}>
                                                {n.title}
                                                {!n.read && <span style={{
                                                    display: 'inline-block', width: '7px', height: '7px',
                                                    borderRadius: '50%', background: theme.accent,
                                                    marginLeft: '0.5rem', verticalAlign: 'middle',
                                                }} />}
                                            </p>
                                            <button onClick={(e) => deleteOne(e, n._id)}
                                                title="Delete"
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: theme.textFaint, padding: '0.2rem', fontSize: '0.8rem',
                                                    opacity: 0.5, transition: 'opacity 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                        <p style={{
                                            color: theme.textMuted, fontSize: '0.85rem',
                                            lineHeight: 1.5, margin: '0.2rem 0 0',
                                        }}>
                                            {n.message}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
                                            <span style={{
                                                fontSize: '0.72rem', fontWeight: '600',
                                                color: cfg.color, background: `${cfg.color}12`,
                                                padding: '0.15rem 0.55rem', borderRadius: '6px',
                                            }}>
                                                {cfg.label}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: theme.textFaint }}>
                                                <i className="fas fa-clock" style={{ marginRight: '0.25rem', fontSize: '0.65rem' }}></i>
                                                {timeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <button onClick={() => fetchNotifications(page - 1)} disabled={page <= 1}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                border: `1px solid ${theme.border}`, background: theme.bgCard,
                                color: page <= 1 ? theme.textFaint : theme.text,
                                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                fontWeight: '600', fontSize: '0.85rem',
                            }}>
                            <i className="fas fa-chevron-left" style={{ marginRight: '0.3rem' }}></i>Previous
                        </button>
                        <span style={{
                            padding: '0.5rem 1rem', color: theme.textMuted, fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center',
                        }}>
                            Page {page} of {totalPages}
                        </span>
                        <button onClick={() => fetchNotifications(page + 1)} disabled={page >= totalPages}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                border: `1px solid ${theme.border}`, background: theme.bgCard,
                                color: page >= totalPages ? theme.textFaint : theme.text,
                                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                                fontWeight: '600', fontSize: '0.85rem',
                            }}>
                            Next<i className="fas fa-chevron-right" style={{ marginLeft: '0.3rem' }}></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
