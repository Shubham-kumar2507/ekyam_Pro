import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import api from '../api/api';
import PostCard from '../components/PostCard';
import { getMediaUrl } from '../utils/media';

export default function Feed() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [searchParams] = useSearchParams();
    const urlProject = searchParams.get('project') || '';
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [project, setProject] = useState(urlProject);
    const [community, setCommunity] = useState('');
    const [postType, setPostType] = useState('individual');
    const [submitting, setSubmitting] = useState(false);
    const [projects, setProjects] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(!!urlProject);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (tab === 'feed' && user) { res = await api.get('/posts/feed'); setPosts(res.data.posts || []); }
            else if (tab === 'my' && user) { res = await api.get(`/posts/user/${user._id}`); setPosts(res.data || []); }
            else { res = await api.get('/posts/all'); setPosts(res.data.posts || []); }
        } catch (err) { console.error(err); }
        setLoading(false);
    }, [tab, user]);

    useEffect(() => {
        fetchPosts();
        if (user) {
            api.get('/projects/my').then(r => setProjects(r.data)).catch(() => { });
            api.get('/communities').then(r => setCommunities(r.data)).catch(() => { });
        }
    }, [fetchPosts, user]);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files).slice(0, 5);
        setFiles(selected);
        setFilePreviews(selected.map(f => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video/') ? 'video' : 'image', name: f.name })));
    };

    const removeFile = (idx) => {
        const newFiles = [...files]; newFiles.splice(idx, 1); setFiles(newFiles);
        const newPreviews = [...filePreviews]; URL.revokeObjectURL(newPreviews[idx].url); newPreviews.splice(idx, 1); setFilePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && files.length === 0) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('postType', postType);
            if (project) formData.append('project', project);
            if (community) formData.append('community', community);
            files.forEach(f => formData.append('media', f));
            const { data } = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setPosts(prev => [data, ...prev]);
            setContent(''); setFiles([]); setFilePreviews([]); setProject(''); setCommunity(''); setPostType('individual'); setShowCreateForm(false);
        } catch (err) { alert(err.response?.data?.message || 'Error creating post'); }
        setSubmitting(false);
    };

    const handleDeletePost = (postId) => { setPosts(prev => prev.filter(p => p._id !== postId)); };

    const avatarStyle = {
        width: '44px', height: '44px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: '700', fontSize: '1.1rem',
        overflow: 'hidden', flexShrink: 0
    };

    const selStyle = {
        padding: '0.4rem 0.7rem', border: `1px solid ${theme.border}`, borderRadius: '8px',
        fontSize: '0.82rem', background: theme.bgInput, color: theme.textSecondary, cursor: 'pointer'
    };

    const tabBtn = (active) => ({
        padding: '0.55rem 1.2rem', border: 'none', borderRadius: '10px',
        background: active ? theme.bgCard : 'transparent',
        color: active ? theme.accentText : theme.textFaint,
        fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer',
        boxShadow: active ? theme.shadow : 'none',
        transition: 'all 0.2s'
    });

    return (
        <div style={{ minHeight: '100vh', background: theme.bg }}>
            {/* Hero */}
            <div style={{ background: theme.heroBg, color: '#fff', padding: '3rem 1rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>📢 Project Feed</h1>
                <p style={{ opacity: 0.85, maxWidth: '600px', margin: '0 auto' }}>
                    Stay updated with the latest project activities, share your progress, and engage with the community.
                </p>
            </div>

            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 1rem' }}>
                {/* Create Post */}
                {user && (
                    <div style={{ background: theme.bgCard, borderRadius: '16px', padding: '1rem 1.25rem', boxShadow: theme.shadow, marginBottom: '1.25rem', border: `1px solid ${theme.border}` }}>
                        {!showCreateForm ? (
                            <div onClick={() => setShowCreateForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <div style={avatarStyle}>
                                    {user.profileImage
                                        ? <img src={getMediaUrl(user.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : user.fullName?.[0] || '?'}
                                </div>
                                <div style={{ flex: 1, padding: '0.65rem 1rem', background: theme.bgMuted, borderRadius: '25px', color: theme.textFaint, fontSize: '0.92rem' }}>
                                    What's happening with your project?
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <textarea value={content} onChange={e => setContent(e.target.value)}
                                    placeholder="Share an update about your project..." rows={3} autoFocus
                                    style={{ width: '100%', padding: '0.85rem', border: `2px solid ${theme.border}`, borderRadius: '12px', fontSize: '0.92rem', resize: 'vertical', fontFamily: 'inherit', minHeight: '80px', transition: 'border-color 0.2s', background: theme.bgInput, color: theme.text }}
                                />

                                {filePreviews.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                        {filePreviews.map((f, i) => (
                                            <div key={i} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', width: '80px', height: '80px' }}>
                                                {f.type === 'video' ? (
                                                    <video src={f.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                )}
                                                <button type="button" onClick={() => removeFile(i)}
                                                    style={{ position: 'absolute', top: '2px', right: '2px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Options */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <select value={postType} onChange={e => setPostType(e.target.value)} style={selStyle}>
                                        <option value="individual">👤 Individual</option>
                                        <option value="community">👥 Community</option>
                                    </select>
                                    <select value={project} onChange={e => setProject(e.target.value)} style={selStyle}>
                                        <option value="">📁 Select Project</option>
                                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                    {postType === 'community' && (
                                        <select value={community} onChange={e => setCommunity(e.target.value)} style={selStyle}>
                                            <option value="">🏘 Select Community</option>
                                            {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${theme.borderLight}` }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', background: theme.bgMuted, borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', color: theme.textMuted, fontWeight: '500' }}>
                                            🖼 Photo<input type="file" accept="image/*" multiple onChange={handleFileChange} hidden />
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', background: theme.bgMuted, borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', color: theme.textMuted, fontWeight: '500' }}>
                                            🎬 Video<input type="file" accept="video/*" multiple onChange={handleFileChange} hidden />
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button type="button" onClick={() => { setShowCreateForm(false); setContent(''); setFiles([]); setFilePreviews([]); }}
                                            style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', background: theme.bgMuted, color: theme.textMuted, fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                                        <button type="submit" disabled={(!content.trim() && files.length === 0) || submitting}
                                            style={{
                                                padding: '0.5rem 1.5rem', border: 'none', borderRadius: '8px',
                                                background: (content.trim() || files.length > 0) ? 'linear-gradient(135deg, #6366f1, #a855f7)' : theme.bgMuted,
                                                color: (content.trim() || files.length > 0) ? '#fff' : theme.textFaint,
                                                fontWeight: '700', fontSize: '0.85rem',
                                                cursor: (content.trim() || files.length > 0) ? 'pointer' : 'default', transition: 'all 0.2s'
                                            }}>{submitting ? 'Posting...' : 'Post'}</button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: theme.bgMuted, borderRadius: '12px', padding: '4px' }}>
                    <button onClick={() => setTab('all')} style={tabBtn(tab === 'all')}>🌐 Explore</button>
                    {user && <button onClick={() => setTab('feed')} style={tabBtn(tab === 'feed')}>📡 My Feed</button>}
                    {user && <button onClick={() => setTab('my')} style={tabBtn(tab === 'my')}>👤 My Posts</button>}
                </div>

                {/* Posts */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: theme.textFaint }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>Loading posts...
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: theme.bgCard, borderRadius: '16px', boxShadow: theme.shadow, border: `1px solid ${theme.border}` }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                        <h3 style={{ color: theme.text, fontWeight: '700', marginBottom: '0.5rem' }}>No posts yet</h3>
                        <p style={{ color: theme.textFaint, fontSize: '0.9rem' }}>
                            {tab === 'feed' ? 'Follow some users to see their posts here!' : 'Be the first to share a project update!'}
                        </p>
                    </div>
                ) : (
                    posts.map(post => (<PostCard key={post._id} post={post} onDelete={handleDeletePost} />))
                )}
            </div>
        </div>
    );
}
