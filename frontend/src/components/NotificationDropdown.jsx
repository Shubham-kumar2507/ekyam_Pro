import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

/* ─── Notification type config ─── */
const TYPE_CONFIG = {
    join_request_community: { icon: 'fas fa-users', color: '#8b5cf6', label: 'Community' },
    join_request_project: { icon: 'fas fa-project-diagram', color: '#3b82f6', label: 'Project' },
    join_approved: { icon: 'fas fa-check-circle', color: '#10b981', label: 'Approved' },
    join_rejected: { icon: 'fas fa-times-circle', color: '#ef4444', label: 'Rejected' },
    resource_shared: { icon: 'fas fa-book', color: '#f59e0b', label: 'Resource' },
    community_update: { icon: 'fas fa-bullhorn', color: '#6366f1', label: 'Community' },
    connection_request: { icon: 'fas fa-user-plus', color: '#ec4899', label: 'Network' },
    connection_accepted: { icon: 'fas fa-handshake', color: '#10b981', label: 'Network' },
    new_follower: { icon: 'fas fa-heart', color: '#f43f5e', label: 'Follower' },
    post_created: { icon: 'fas fa-pen-fancy', color: '#14b8a6', label: 'Feed' },
    project_update: { icon: 'fas fa-tasks', color: '#3b82f6', label: 'Project' },
    general: { icon: 'fas fa-bell', color: '#6b7280', label: 'General' },
};

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationDropdown({ isLightHome = false }) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropRef = useRef(null);

    // Fetch unread count periodically
    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/notifications/unread-count', { skipLoader: true });
            setUnreadCount(data.count);
        } catch { /* silent */ }
    }, [user]);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // every 30s
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // Fetch full list when dropdown opens
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notifications?limit=15', { skipLoader: true });
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch { /* silent */ }
        setLoading(false);
    };

    const handleToggle = () => {
        const next = !open;
        setOpen(next);
        if (next) fetchNotifications();
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`, {}, { skipLoader: true });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* silent */ }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all', {}, { skipLoader: true });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch { /* silent */ }
    };

    const handleClick = (n) => {
        if (!n.read) markAsRead(n._id);
        if (n.link) {
            navigate(n.link);
            setOpen(false);
        }
    };

    if (!user) return null;

    const bellBg = isLightHome ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)';
    const bellBgHover = isLightHome ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.25)';
    const bellBorder = isLightHome ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.25)';
    const bellColor = isLightHome ? '#1f2937' : '#fff';

    return (
        <div style={{ position: 'relative' }} ref={dropRef}>
            {/* Bell button */}
            <button
                onClick={handleToggle}
                title="Notifications"
                style={{
                    position: 'relative',
                    background: bellBg,
                    border: `1px solid ${bellBorder}`,
                    color: bellColor,
                    padding: '0.4rem 0.55rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = bellBgHover; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = bellBg; e.currentTarget.style.transform = 'scale(1)'; }}
            >
                <i className="fas fa-bell" style={{ fontSize: '0.95rem' }}></i>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-5px',
                        background: '#ef4444', color: '#fff',
                        fontSize: '0.65rem', fontWeight: '800',
                        minWidth: '18px', height: '18px',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px',
                        boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                        animation: 'pulse-badge 2s ease-in-out infinite',
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute',
                    right: 0, top: '100%',
                    marginTop: '0.5rem',
                    width: '380px',
                    maxHeight: '480px',
                    background: theme.bgCard,
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    border: `1px solid ${theme.border}`,
                    overflow: 'hidden',
                    zIndex: 200,
                    animation: 'notif-in 0.2s ease-out',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '1rem 1.25rem',
                        borderBottom: `1px solid ${theme.border}`,
                        background: theme.bgCardHover,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fas fa-bell" style={{ color: theme.accent, fontSize: '0.9rem' }}></i>
                            <h3 style={{ fontWeight: '700', fontSize: '1rem', color: theme.text, margin: 0 }}>Notifications</h3>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: theme.accent, color: '#fff',
                                    fontSize: '0.7rem', fontWeight: '700',
                                    padding: '0.1rem 0.5rem', borderRadius: '10px',
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead}
                                style={{
                                    background: 'none', border: 'none', color: theme.accentText,
                                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                                    padding: '0.25rem 0.5rem', borderRadius: '6px',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = theme.accentLight}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                                <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: theme.accent }}></i>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: theme.textFaint }}>
                                <i className="fas fa-bell-slash" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'block', opacity: 0.4 }}></i>
                                <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem', color: theme.textMuted }}>No notifications yet</p>
                                <p style={{ fontSize: '0.82rem' }}>We'll notify you when something happens</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
                                return (
                                    <div
                                        key={n._id}
                                        onClick={() => handleClick(n)}
                                        style={{
                                            display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
                                            padding: '0.85rem 1.25rem',
                                            cursor: n.link ? 'pointer' : 'default',
                                            background: n.read ? 'transparent' : (theme.name === 'dark' ? 'rgba(99,102,241,0.06)' : 'rgba(79,70,229,0.04)'),
                                            borderBottom: `1px solid ${theme.borderLight}`,
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = theme.bgCardHover}
                                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : (theme.name === 'dark' ? 'rgba(99,102,241,0.06)' : 'rgba(79,70,229,0.04)')}
                                    >
                                        {/* Icon */}
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '10px',
                                            background: `${cfg.color}18`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <i className={cfg.icon} style={{ color: cfg.color, fontSize: '0.85rem' }}></i>
                                        </div>
                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                <p style={{
                                                    fontWeight: n.read ? '500' : '650',
                                                    fontSize: '0.88rem', color: theme.text,
                                                    lineHeight: 1.4, margin: 0,
                                                }}>
                                                    {n.title}
                                                </p>
                                                {!n.read && (
                                                    <span style={{
                                                        width: '8px', height: '8px', borderRadius: '50%',
                                                        background: theme.accent, flexShrink: 0, marginTop: '5px',
                                                    }} />
                                                )}
                                            </div>
                                            <p style={{
                                                color: theme.textMuted, fontSize: '0.82rem',
                                                lineHeight: 1.4, margin: '0.15rem 0 0',
                                                overflow: 'hidden', textOverflow: 'ellipsis',
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                            }}>
                                                {n.message}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                                                <span style={{
                                                    fontSize: '0.7rem', fontWeight: '600',
                                                    color: cfg.color, background: `${cfg.color}15`,
                                                    padding: '0.1rem 0.45rem', borderRadius: '5px',
                                                }}>
                                                    {cfg.label}
                                                </span>
                                                <span style={{ fontSize: '0.72rem', color: theme.textFaint }}>
                                                    {timeAgo(n.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div style={{
                            padding: '0.75rem', borderTop: `1px solid ${theme.border}`,
                            textAlign: 'center',
                        }}>
                            <button
                                onClick={() => { navigate('/notifications'); setOpen(false); }}
                                style={{
                                    background: 'none', border: 'none', color: theme.accentText,
                                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                                    padding: '0.4rem 1rem', borderRadius: '8px',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = theme.accentLight}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                View All Notifications <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem', marginLeft: '0.3rem' }}></i>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Inline styles for animations */}
            <style>{`
                @keyframes notif-in {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes pulse-badge {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
}
