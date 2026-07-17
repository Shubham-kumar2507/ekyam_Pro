import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import api from '../api/api';
import UserCard from '../components/UserCard';
import { getMediaUrl } from '../utils/media';

export default function MyNetwork() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('followers');
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [followersRes, followingRes, requestsRes] = await Promise.all([
                api.get(`/connections/followers/${user._id}`),
                api.get(`/connections/following/${user._id}`),
                api.get('/connections/requests')
            ]);
            setFollowers(followersRes.data);
            setFollowing(followingRes.data);
            setRequests(requestsRes.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) fetchData();
    }, [user, fetchData]);

    const handleSearch = async (q) => {
        setSearchQuery(q);
        if (!q.trim()) { setSearchResults([]); return; }
        setSearchLoading(true);
        try {
            const { data } = await api.get(`/connections/search?q=${encodeURIComponent(q)}`);
            setSearchResults(data);
        } catch (err) { console.error(err); }
        setSearchLoading(false);
    };

    const handleRespond = async (connectionId, action) => {
        try {
            await api.put(`/connections/respond/${connectionId}`, { action });
            setRequests(prev => prev.filter(r => r._id !== connectionId));
            if (action === 'accept') fetchData();
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    const tabBtn = (active) => ({
        padding: '0.55rem 1.2rem', border: 'none', borderRadius: '10px',
        background: active ? theme.tabActiveBg : 'transparent',
        color: active ? theme.tabActiveText : theme.tabInactiveText,
        fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer',
        boxShadow: active ? theme.shadow : 'none',
        transition: 'all 0.2s', position: 'relative'
    });

    const avatarSmall = {
        width: '44px', height: '44px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: '700', fontSize: '1.1rem',
        overflow: 'hidden', flexShrink: 0
    };

    const emptyState = (icon, title, subtitle) => (
        <div style={{
            textAlign: 'center', padding: '3rem', background: theme.bgCard,
            borderRadius: '16px', boxShadow: theme.shadow, border: `1px solid ${theme.border}`
        }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{icon}</div>
            <h3 style={{ color: theme.text, fontWeight: '700', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: theme.textFaint, fontSize: '0.9rem' }}>{subtitle}</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, transition: 'background-color 0.3s ease' }}>
            {/* Hero */}
            <div style={{
                background: theme.heroBg,
                color: '#fff', padding: '3rem 1rem', textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>🤝 My Network</h1>
                <p style={{ opacity: 0.85, maxWidth: '600px', margin: '0 auto' }}>
                    Manage your connections, discover people, and grow your professional network.
                </p>
            </div>

            <div style={{ maxWidth: '750px', margin: '0 auto', padding: '1.5rem 1rem' }}>
                {/* Search */}
                <div style={{
                    background: theme.bgCard, borderRadius: '14px', padding: '1rem 1.25rem',
                    boxShadow: theme.shadow, marginBottom: '1.25rem',
                    border: `1px solid ${theme.border}`, transition: 'background-color 0.3s ease'
                }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="🔍 Search people by name or username..."
                            style={{
                                width: '100%', padding: '0.7rem 1rem', border: `2px solid ${theme.border}`,
                                borderRadius: '12px', fontSize: '0.92rem', background: theme.bgInput,
                                color: theme.text, outline: 'none', transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    {/* Search Results */}
                    {searchQuery && (
                        <div style={{ marginTop: '0.75rem' }}>
                            {searchLoading ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: theme.textFaint, fontSize: '0.85rem' }}>Searching...</div>
                            ) : searchResults.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: theme.textFaint, fontSize: '0.85rem' }}>No users found</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {searchResults.map(u => (
                                        <UserCard key={u._id} userInfo={u} initialStatus="none" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '0.25rem', marginBottom: '1.25rem',
                    background: theme.bgMuted, borderRadius: '12px', padding: '4px',
                    transition: 'background-color 0.3s ease'
                }}>
                    <button onClick={() => setActiveTab('followers')} style={tabBtn(activeTab === 'followers')}>
                        👥 Followers ({followers.length})
                    </button>
                    <button onClick={() => setActiveTab('following')} style={tabBtn(activeTab === 'following')}>
                        ➡️ Following ({following.length})
                    </button>
                    <button onClick={() => setActiveTab('requests')} style={tabBtn(activeTab === 'requests')}>
                        📩 Requests
                        {requests.length > 0 && (
                            <span className="badge-pulse" style={{
                                position: 'absolute', top: '-5px', right: '-5px',
                                background: '#ef4444', color: '#fff', borderRadius: '50%',
                                width: '18px', height: '18px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: '700'
                            }}>{requests.length}</span>
                        )}
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: theme.textFaint }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                        Loading...
                    </div>
                ) : (
                    <>
                        {/* Followers Tab */}
                        {activeTab === 'followers' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {followers.length === 0
                                    ? emptyState('👥', 'No followers yet', 'Share your projects and engage to grow your network!')
                                    : followers.map(u => (
                                        <UserCard key={u._id} userInfo={u} initialStatus="none" />
                                    ))}
                            </div>
                        )}

                        {/* Following Tab */}
                        {activeTab === 'following' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {following.length === 0
                                    ? emptyState('🔍', 'Not following anyone', 'Discover and follow users to see their updates!')
                                    : following.map(u => (
                                        <UserCard key={u._id} userInfo={u} initialStatus="following" />
                                    ))}
                            </div>
                        )}

                        {/* Requests Tab */}
                        {activeTab === 'requests' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {requests.length === 0
                                    ? emptyState('📭', 'No pending requests', 'All caught up!')
                                    : requests.map(req => (
                                        <div key={req._id} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.85rem',
                                            background: theme.bgCard, padding: '1rem 1.25rem', borderRadius: '14px',
                                            boxShadow: theme.shadow, border: `1px solid ${theme.border}`,
                                            transition: 'background-color 0.3s ease'
                                        }}>
                                            <Link to={`/users/${req.follower._id}`} style={{ textDecoration: 'none' }}>
                                                <div style={avatarSmall}>
                                                    {req.follower.profileImage
                                                        ? <img src={getMediaUrl(req.follower.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : req.follower.fullName?.[0] || '?'}
                                                </div>
                                            </Link>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <Link to={`/users/${req.follower._id}`} style={{ textDecoration: 'none' }}>
                                                    <div style={{ fontWeight: '700', color: theme.text, fontSize: '0.95rem' }}>{req.follower.fullName}</div>
                                                    <div style={{ fontSize: '0.78rem', color: theme.textFaint }}>@{req.follower.username}</div>
                                                </Link>
                                                {req.follower.bio && (
                                                    <div style={{ fontSize: '0.8rem', color: theme.textMuted, marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.follower.bio}</div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => handleRespond(req._id, 'accept')}
                                                    style={{
                                                        padding: '0.45rem 1rem', border: 'none', borderRadius: '8px',
                                                        background: theme.accent, color: '#fff', fontWeight: '600',
                                                        fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >Accept</button>
                                                <button
                                                    onClick={() => handleRespond(req._id, 'reject')}
                                                    style={{
                                                        padding: '0.45rem 1rem', border: 'none', borderRadius: '8px',
                                                        background: theme.bgMuted, color: theme.textMuted, fontWeight: '600',
                                                        fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >Decline</button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
