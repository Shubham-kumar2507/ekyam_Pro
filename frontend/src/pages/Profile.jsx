import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const { theme } = useTheme();
    const fileRef = useRef(null);
    const [form, setForm] = useState({ fullName: user?.fullName || '', bio: user?.bio || '', location: user?.location || '' });
    const [socialLinks, setSocialLinks] = useState({
        linkedin: user?.socialLinks?.linkedin || '',
        github: user?.socialLinks?.github || '',
        leetcode: user?.socialLinks?.leetcode || '',
        codeforces: user?.socialLinks?.codeforces || '',
        twitter: user?.socialLinks?.twitter || '',
        portfolio: user?.socialLinks?.portfolio || '',
        kaggle: user?.socialLinks?.kaggle || '',
        medium: user?.socialLinks?.medium || '',
    });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingPic, setUploadingPic] = useState(false);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        api.get('/projects/user/me').then(r => setProjects(r.data)).catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setMsg(''); setError('');
        try {
            const { data } = await api.put('/users/profile', { ...form, socialLinks });
            updateUser(data);
            setMsg('Profile updated successfully!');
        } catch (err) { setError(err.response?.data?.message || 'Error updating profile'); }
        setLoading(false);
    };

    const handleProfilePic = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingPic(true); setMsg(''); setError('');
        try {
            const formData = new FormData();
            formData.append('profileImage', file);
            const { data } = await api.post('/users/profile/picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            updateUser(data);
            setMsg('Profile picture updated!');
        } catch (err) { setError(err.response?.data?.message || 'Error uploading picture'); }
        setUploadingPic(false);
    };

    const profileImageUrl = getMediaUrl(user?.profileImage);

    const inputStyle = { width: '100%', padding: '0.7rem 1rem', border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '0.9rem', outline: 'none', marginTop: '0.25rem', background: theme.bgInput, color: theme.text };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '500', color: theme.textSecondary };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' }}>
                {msg && <div style={{ background: theme.successBg, border: `1px solid ${theme.success}`, color: theme.success, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}><i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>{msg}</div>}
                {error && <div style={{ background: theme.errorBg, border: `1px solid ${theme.errorBorder}`, color: theme.error, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}><i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>{error}</div>}

                <div style={{ background: theme.bgCard, borderRadius: '8px', boxShadow: theme.shadow, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                    <div style={{ padding: '2rem' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
                                    {profileImageUrl ? (
                                        <img src={profileImageUrl} alt="Profile" style={{ width: '128px', height: '128px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '128px', height: '128px', borderRadius: '50%', background: theme.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="fas fa-user" style={{ fontSize: '3rem', color: theme.accentText }}></i>
                                        </div>
                                    )}
                                    <label style={{ position: 'absolute', bottom: '0', right: '0', background: theme.bgCard, borderRadius: '50%', padding: '0.5rem', boxShadow: theme.shadow, cursor: 'pointer' }}>
                                        {uploadingPic ?
                                            <i className="fas fa-spinner fa-spin" style={{ color: theme.accent }}></i> :
                                            <i className="fas fa-camera" style={{ color: theme.accent }}></i>
                                        }
                                    </label>
                                    <input ref={fileRef} type="file" accept="image/*" onChange={handleProfilePic} style={{ display: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Username</label>
                                    <input type="text" value={user?.username || ''} disabled style={{ ...inputStyle, background: theme.bgMuted, cursor: 'not-allowed' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input type="email" value={user?.email || ''} disabled style={{ ...inputStyle, background: theme.bgMuted, cursor: 'not-allowed' }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Location</label>
                                    <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, Country" style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Bio</label>
                                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4}
                                    style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell us about yourself..." />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" disabled={loading}
                                    style={{ background: loading ? '#9ca3af' : theme.accent, color: '#fff', padding: '0.65rem 1.5rem', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Social Links Section */}
                <div style={{ background: theme.bgCard, borderRadius: '8px', boxShadow: theme.shadow, overflow: 'hidden', border: `1px solid ${theme.border}`, marginTop: '1.5rem' }}>
                    <div style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: theme.text, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fas fa-link" style={{ color: theme.accentText }}></i>
                            Connected Platforms
                        </h2>
                        <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginBottom: '1.5rem' }}>Link your professional profiles to showcase your skills and activity</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {[
                                { key: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0A66C2', placeholder: 'https://linkedin.com/in/username' },
                                { key: 'github', label: 'GitHub', icon: 'fab fa-github', color: theme.name === 'dark' ? '#f0f0f0' : '#333', placeholder: 'https://github.com/username' },
                                { key: 'leetcode', label: 'LeetCode', icon: 'fas fa-code', color: '#FFA116', placeholder: 'https://leetcode.com/u/username' },
                                { key: 'codeforces', label: 'Codeforces', icon: 'fas fa-trophy', color: '#1F8ACB', placeholder: 'https://codeforces.com/profile/handle' },
                                { key: 'twitter', label: 'Twitter / X', icon: 'fab fa-twitter', color: '#1DA1F2', placeholder: 'https://x.com/username' },
                                { key: 'portfolio', label: 'Portfolio', icon: 'fas fa-globe', color: '#6366f1', placeholder: 'https://yourwebsite.com' },
                                { key: 'kaggle', label: 'Kaggle', icon: 'fas fa-chart-bar', color: '#20BEFF', placeholder: 'https://kaggle.com/username' },
                                { key: 'medium', label: 'Medium', icon: 'fab fa-medium', color: theme.name === 'dark' ? '#fff' : '#000', placeholder: 'https://medium.com/@username' },
                            ].map(platform => (
                                <div key={platform.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '8px',
                                        background: `${platform.color}15`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <i className={platform.icon} style={{ color: platform.color, fontSize: '1rem' }}></i>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ ...labelStyle, fontSize: '0.78rem', marginBottom: '0.15rem' }}>{platform.label}</label>
                                        <input
                                            type="text"
                                            value={socialLinks[platform.key]}
                                            onChange={e => setSocialLinks({ ...socialLinks, [platform.key]: e.target.value })}
                                            placeholder={platform.placeholder}
                                            style={{ ...inputStyle, marginTop: 0, padding: '0.55rem 0.75rem', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                    {socialLinks[platform.key] && (
                                        <button
                                            type="button"
                                            onClick={() => setSocialLinks({ ...socialLinks, [platform.key]: '' })}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: theme.textFaint, fontSize: '0.8rem', padding: '0.25rem',
                                                alignSelf: 'flex-end', marginBottom: '0.3rem',
                                            }}
                                            title="Clear"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${theme.borderLight || theme.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={async () => {
                                    setLoading(true); setMsg(''); setError('');
                                    try {
                                        const { data } = await api.put('/users/profile', { ...form, socialLinks });
                                        updateUser(data);
                                        setMsg('Social links saved successfully!');
                                    } catch (err) { setError(err.response?.data?.message || 'Error saving links'); }
                                    setLoading(false);
                                }}
                                disabled={loading}
                                style={{
                                    background: loading ? '#9ca3af' : theme.accent,
                                    color: '#fff', padding: '0.65rem 1.5rem', border: 'none',
                                    borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                }}
                            >
                                <i className="fas fa-save"></i>
                                {loading ? 'Saving...' : 'Save Links'}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.text, marginBottom: '1rem' }}>Your Projects</h2>
                    {projects.length === 0 ? (
                        <div style={{ background: theme.bgCard, borderRadius: '8px', padding: '2rem', textAlign: 'center', boxShadow: theme.shadow, border: `1px solid ${theme.border}` }}>
                            <p style={{ color: theme.textFaint }}>No projects yet. <Link to="/create-project" style={{ color: theme.accentText }}>Create one!</Link></p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                            {projects.map(p => (
                                <div key={p._id} style={{ background: theme.bgCard, borderRadius: '8px', boxShadow: theme.shadow, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                                    <div style={{ padding: '1.25rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                                            <Link to={`/projects/${p._id}`} style={{ color: theme.text, textDecoration: 'none' }}
                                                onMouseEnter={e => e.currentTarget.style.color = theme.accentText}
                                                onMouseLeave={e => e.currentTarget.style.color = theme.text}>
                                                {p.name}
                                            </Link>
                                        </h3>
                                        <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: theme.textFaint }}>
                                            <span><i className="fas fa-users" style={{ marginRight: '0.25rem' }}></i>{p.members?.length || 0} members</span>
                                            <span><i className="fas fa-calendar" style={{ marginRight: '0.25rem' }}></i>{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
