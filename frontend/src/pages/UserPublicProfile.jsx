import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import api from '../api/api';
import PostCard from '../components/PostCard';
import { getMediaUrl } from '../utils/media';
import PlatformLinksWidget from '../components/PlatformLinksWidget';

export default function UserPublicProfile() {
    const { id } = useParams();
    const { user } = useAuth();
    const { theme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState('none'); // none, following, connected, pending
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const [profileRes, postsRes] = await Promise.all([
                api.get(`/connections/user/${id}`),
                api.get(`/posts/user/${id}`)
            ]);
            setProfile(profileRes.data);
            setPosts(postsRes.data || []);

            if (user && user._id !== id) {
                const statusRes = await api.get(`/connections/status/${id}`);
                setStatus(statusRes.data.status);
            }
        } catch (err) { console.error(err); }
        setLoading(false);
    }, [id, user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const fetchFollowers = async () => {
        try {
            const res = await api.get(`/connections/followers/${id}`);
            setFollowers(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchFollowing = async () => {
        try {
            const res = await api.get(`/connections/following/${id}`);
            setFollowing(res.data);
        } catch (err) { console.error(err); }
    };

    const handleFollow = async () => {
        setStatusLoading(true);
        try {
            await api.post(`/connections/follow/${id}`);
            setStatus('following');
            setProfile(p => ({ ...p, followerCount: (p.followerCount || 0) + 1 }));
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
        setStatusLoading(false);
    };

    const handleUnfollow = async () => {
        setStatusLoading(true);
        try {
            await api.delete(`/connections/unfollow/${id}`);
            setStatus('none');
            setProfile(p => ({ ...p, followerCount: Math.max(0, (p.followerCount || 1) - 1) }));
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
        setStatusLoading(false);
    };

    const handleConnect = async () => {
        setStatusLoading(true);
        try {
            await api.post(`/connections/connect/${id}`);
            setStatus('pending');
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
        setStatusLoading(false);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'followers' && followers.length === 0) fetchFollowers();
        if (tab === 'following' && following.length === 0) fetchFollowing();
    };

    const handleDeletePost = (postId) => {
        setPosts(prev => prev.filter(p => p._id !== postId));
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ fontSize: '2rem', color: '#6366f1' }}>⏳</div>
        </div>
    );
    if (!profile) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>User not found</div>
    );

    const isSelf = user && user._id === id;

    const avatarStyle = {
        width: '110px', height: '110px', borderRadius: '50%',
        border: '4px solid #fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: '800', fontSize: '2.5rem',
        overflow: 'hidden', margin: '0 auto'
    };

    const statBox = { textAlign: 'center', cursor: 'pointer' };
    const statNum = { fontSize: '1.4rem', fontWeight: '800', color: '#1f2937' };
    const statLabel = { fontSize: '0.78rem', color: '#9ca3af', fontWeight: '500' };

    const tabBtn = (active) => ({
        padding: '0.55rem 1.2rem', border: 'none', borderRadius: '10px',
        background: active ? theme.tabActiveBg : 'transparent',
        color: active ? theme.tabActiveText : theme.tabInactiveText,
        fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer',
        boxShadow: active ? theme.shadow : 'none',
        transition: 'all 0.2s'
    });

    const actionBtnStyle = (bg, color) => ({
        padding: '0.6rem 1.8rem', border: 'none', borderRadius: '10px',
        background: bg, color: color, fontWeight: '700', fontSize: '0.9rem',
        cursor: statusLoading ? 'wait' : 'pointer', opacity: statusLoading ? 0.7 : 1,
        transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    });

    const userCardSmall = (u) => (
        <Link
            key={u._id}
            to={`/users/${u._id}`}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', background: theme.bgCard, borderRadius: '12px',
                textDecoration: 'none', color: 'inherit',
                boxShadow: theme.shadow, transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: '600', fontSize: '1rem',
                overflow: 'hidden', flexShrink: 0
            }}>
                {u.profileImage
                    ? <img src={getMediaUrl(u.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : u.fullName?.[0] || '?'}
            </div>
            <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: theme.text }}>{u.fullName}</div>
                <div style={{ fontSize: '0.75rem', color: theme.textFaint }}>@{u.username}</div>
            </div>
        </Link>
    );

    return (
        <div style={{ minHeight: '100vh', background: theme.bg }}>
            {/* Profile Header */}
            <div style={{
                background: theme.heroBg,
                color: '#fff', padding: '3rem 1rem 4rem', textAlign: 'center', position: 'relative'
            }}>
                <div style={avatarStyle}>
                    {profile.profileImage
                        ? <img src={getMediaUrl(profile.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : profile.fullName?.[0] || '?'}
                </div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '1rem', marginBottom: '0.2rem' }}>
                    {profile.fullName}
                </h1>
                <p style={{ opacity: 0.8, marginBottom: '0.3rem' }}>@{profile.username}</p>
                {profile.location && (
                    <p style={{ opacity: 0.7, fontSize: '0.88rem' }}>📍 {profile.location}</p>
                )}
                {profile.bio && (
                    <p style={{ opacity: 0.85, maxWidth: '500px', margin: '0.5rem auto 0', lineHeight: '1.6', fontSize: '0.92rem' }}>{profile.bio}</p>
                )}

                {/* Social Platform Icons */}
                {profile.socialLinks && Object.values(profile.socialLinks).some(v => v) && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <PlatformLinksWidget socialLinks={profile.socialLinks} theme={theme} compact={true} />
                    </div>
                )}

                {/* Stats */}
                <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', marginTop: '1.25rem' }}>
                    <div style={statBox} onClick={() => handleTabChange('posts')}>
                        <div style={{ ...statNum, color: '#fff' }}>{posts.length}</div>
                        <div style={{ ...statLabel, color: 'rgba(255,255,255,0.7)' }}>Posts</div>
                    </div>
                    <div style={statBox} onClick={() => handleTabChange('followers')}>
                        <div style={{ ...statNum, color: '#fff' }}>{profile.followerCount || 0}</div>
                        <div style={{ ...statLabel, color: 'rgba(255,255,255,0.7)' }}>Followers</div>
                    </div>
                    <div style={statBox} onClick={() => handleTabChange('following')}>
                        <div style={{ ...statNum, color: '#fff' }}>{profile.followingCount || 0}</div>
                        <div style={{ ...statLabel, color: 'rgba(255,255,255,0.7)' }}>Following</div>
                    </div>
                </div>

                {/* Action Buttons */}
                {user && !isSelf && (
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem' }}>
                        {status === 'none' && (
                            <>
                                <button onClick={handleFollow} disabled={statusLoading} style={actionBtnStyle('#fff', '#4f46e5')}>Follow</button>
                                <button onClick={handleConnect} disabled={statusLoading} style={actionBtnStyle('rgba(255,255,255,0.15)', '#fff')}>Connect</button>
                            </>
                        )}
                        {status === 'following' && (
                            <button onClick={handleUnfollow} disabled={statusLoading} style={actionBtnStyle('rgba(255,255,255,0.15)', '#fff')}>Unfollow</button>
                        )}
                        {status === 'connected' && (
                            <span style={{ ...actionBtnStyle('#10b981', '#fff'), cursor: 'default' }}>✓ Connected</span>
                        )}
                        {status === 'pending' && (
                            <span style={{ ...actionBtnStyle('rgba(255,255,255,0.15)', '#fbbf24'), cursor: 'default' }}>⏳ Request Sent</span>
                        )}
                    </div>
                )}
                {isSelf && (
                    <Link to="/profile" style={{
                        display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1.5rem',
                        background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px',
                        textDecoration: 'none', fontWeight: '600', fontSize: '0.88rem'
                    }}>
                        Edit Profile
                    </Link>
                )}
            </div>

            {/* Content */}
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 1rem' }}>
                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '0.25rem', marginBottom: '1.25rem',
                    background: theme.bgMuted, borderRadius: '12px', padding: '4px'
                }}>
                    <button onClick={() => handleTabChange('posts')} style={tabBtn(activeTab === 'posts')}>📝 Posts</button>
                    <button onClick={() => handleTabChange('followers')} style={tabBtn(activeTab === 'followers')}>👥 Followers</button>
                    <button onClick={() => handleTabChange('following')} style={tabBtn(activeTab === 'following')}>➡️ Following</button>
                    {profile.socialLinks && Object.values(profile.socialLinks).some(v => v) && (
                        <button onClick={() => handleTabChange('platforms')} style={tabBtn(activeTab === 'platforms')}>📊 Platforms</button>
                    )}
                </div>

                {activeTab === 'posts' && (
                    posts.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '3rem', background: theme.bgCard,
                            borderRadius: '16px', boxShadow: theme.shadow
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                            <h3 style={{ color: theme.text, fontWeight: '700', marginBottom: '0.5rem' }}>No posts yet</h3>
                            <p style={{ color: theme.textFaint, fontSize: '0.9rem' }}>
                                {isSelf ? 'Share your first project update!' : 'This user hasn\'t posted yet.'}
                            </p>
                        </div>
                    ) : posts.map(post => <PostCard key={post._id} post={post} onDelete={handleDeletePost} />)
                )}

                {activeTab === 'followers' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {followers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: theme.textFaint }}>No followers yet</div>
                        ) : followers.map(u => userCardSmall(u))}
                    </div>
                )}

                {activeTab === 'following' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {following.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: theme.textFaint }}>Not following anyone yet</div>
                        ) : following.map(u => userCardSmall(u))}
                    </div>
                )}

                {activeTab === 'platforms' && (
                    <div style={{
                        background: theme.bgCard, borderRadius: '16px',
                        boxShadow: theme.shadow, padding: '1.5rem',
                    }}>
                        <PlatformLinksWidget socialLinks={profile.socialLinks} theme={theme} showStats={true} />
                    </div>
                )}
            </div>
        </div>
    );
}
