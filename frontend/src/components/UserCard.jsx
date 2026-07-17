import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';

export default function UserCard({ userInfo, initialStatus, onStatusChange }) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [status, setStatus] = useState(initialStatus || 'none');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !userInfo || user._id === userInfo._id) return;
        let cancelled = false;
        const fetchStatus = async () => {
            try {
                const res = await api.get(`/connections/status/${userInfo._id}`);
                if (!cancelled) setStatus(res.data.status || 'none');
            } catch { /* ignore */ }
        };
        fetchStatus();
        return () => { cancelled = true; };
    }, [user, userInfo]);

    const isSelf = user && userInfo && user._id === userInfo._id;

    const handleFollow = async () => {
        setLoading(true);
        try { await api.post(`/connections/follow/${userInfo._id}`); setStatus('following'); onStatusChange?.('following'); } catch (err) { console.error(err); }
        setLoading(false);
    };
    const handleUnfollow = async () => {
        setLoading(true);
        try { await api.delete(`/connections/unfollow/${userInfo._id}`); setStatus('none'); onStatusChange?.('none'); } catch (err) { console.error(err); }
        setLoading(false);
    };
    const handleConnect = async () => {
        setLoading(true);
        try { await api.post(`/connections/connect/${userInfo._id}`); setStatus('pending'); onStatusChange?.('pending'); } catch (err) { console.error(err); }
        setLoading(false);
    };

    const avatarStyle = {
        width: '52px', height: '52px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: '700', fontSize: '1.2rem',
        overflow: 'hidden', flexShrink: 0
    };

    const actionBtn = (bg, color) => ({
        padding: '0.4rem 0.9rem', border: 'none', borderRadius: '8px',
        background: bg, color: color, fontWeight: '600', fontSize: '0.8rem',
        cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s',
        opacity: loading ? 0.7 : 1
    });

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.85rem',
            background: theme.bgCard, padding: '1rem 1.25rem', borderRadius: '14px',
            boxShadow: theme.shadow, border: `1px solid ${theme.border}`,
            transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.3s',
            cursor: 'pointer'
        }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = theme.shadowHover; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.shadow; }}
        >
            <Link to={`/users/${userInfo._id}`} style={{ textDecoration: 'none' }}>
                <div style={avatarStyle}>
                    {userInfo.profileImage
                        ? <img src={getMediaUrl(userInfo.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : userInfo.fullName?.[0] || '?'}
                </div>
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/users/${userInfo._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ fontWeight: '700', color: theme.text, fontSize: '0.95rem' }}>{userInfo.fullName}</div>
                    <div style={{ fontSize: '0.78rem', color: theme.textFaint }}>@{userInfo.username}</div>
                </Link>
                {userInfo.bio && (
                    <div style={{ fontSize: '0.8rem', color: theme.textMuted, marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {userInfo.bio}
                    </div>
                )}
            </div>

            {user && !isSelf && (
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    {status === 'none' && (
                        <>
                            <button onClick={handleFollow} disabled={loading} style={actionBtn(theme.accent, '#fff')}>Follow</button>
                            <button onClick={handleConnect} disabled={loading} style={actionBtn(theme.bgMuted, theme.textSecondary)}>Connect</button>
                        </>
                    )}
                    {status === 'following' && (
                        <button onClick={handleUnfollow} disabled={loading} style={actionBtn(theme.errorBg, theme.error)}>Unfollow</button>
                    )}
                    {status === 'connected' && (
                        <span style={{ fontSize: '0.8rem', color: theme.success, fontWeight: '600', padding: '0.4rem 0.9rem', background: theme.successBg, borderRadius: '8px' }}>✓ Connected</span>
                    )}
                    {status === 'pending' && (
                        <span style={{ fontSize: '0.8rem', color: theme.warning, fontWeight: '600', padding: '0.4rem 0.9rem', background: theme.warningBg, borderRadius: '8px' }}>⏳ Pending</span>
                    )}
                </div>
            )}
        </div>
    );
}
