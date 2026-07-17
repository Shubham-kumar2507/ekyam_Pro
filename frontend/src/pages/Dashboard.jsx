import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';
import PlatformLinksWidget from '../components/PlatformLinksWidget';

export default function Dashboard() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [projects, setProjects] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pRes, cRes, rRes] = await Promise.allSettled([
                    api.get('/projects/user/me'),
                    api.get('/communities/user/me'),
                    api.get('/resources/user/me'),
                ]);
                setProjects(pRes.status === 'fulfilled' ? pRes.value.data : []);
                setCommunities(cRes.status === 'fulfilled' ? cRes.value.data : []);
                setResources(rRes.status === 'fulfilled' ? rRes.value.data : []);
            } catch (err) { /* fallback empty */ }
            setLoading(false);
        };
        fetchData();
    }, []);

    const card = { background: theme.bgCard, borderRadius: '8px', boxShadow: theme.shadow, padding: '1.5rem', border: `1px solid ${theme.border}`, transition: 'background-color 0.3s ease' };
    const typeIcons = { document: 'fas fa-file-alt', link: 'fas fa-link', video: 'fas fa-video', image: 'fas fa-image', code: 'fas fa-code', other: 'fas fa-file' };
    const profileImageUrl = getMediaUrl(user?.profileImage);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: theme.accent }}></i>
        </div>
    );

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif", transition: 'background-color 0.3s ease' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
                {/* Welcome */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: theme.text }}>{getGreeting()}, {user?.fullName || user?.username}! 👋</h1>
                    <p style={{ color: theme.textMuted, marginTop: '0.25rem' }}>Access your projects, resources, and connect with communities</p>
                </div>

                {/* Main Grid */}
                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Overview Stats */}
                        <div style={card}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1rem', color: theme.text }}>Overview</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: theme.accentLight, borderRadius: '8px', padding: '1rem', borderLeft: '4px solid #4f46e5' }}>
                                    <h3 style={{ color: theme.textMuted, fontSize: '0.8rem', marginBottom: '0.25rem' }}>Active Projects</h3>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.accentText }}>{ projects.length}</p>
                                </div>
                                <div style={{ background: theme.name === 'dark' ? '#064e3b' : '#ecfdf5', borderRadius: '8px', padding: '1rem', borderLeft: '4px solid #059669' }}>
                                    <h3 style={{ color: theme.textMuted, fontSize: '0.8rem', marginBottom: '0.25rem' }}>Available Resources</h3>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: theme.success }}>{resources.length}</p>
                                </div>
                                <div style={{ background: theme.name === 'dark' ? '#2e1065' : '#f5f3ff', borderRadius: '8px', padding: '1rem', borderLeft: '4px solid #7c3aed' }}>
                                    <h3 style={{ color: theme.textMuted, fontSize: '0.8rem', marginBottom: '0.25rem' }}>Communities Joined</h3>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#7c3aed' }}>{communities.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Projects */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: '600', color: theme.text }}>Recent Projects</h2>
                                <Link to="/projects" style={{ color: theme.accentText, textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}>View All Projects</Link>
                            </div>
                            {projects.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                                    <p style={{ color: theme.textFaint }}>No projects found.</p>
                                    <Link to="/create-project" style={{ display: 'inline-block', marginTop: '0.75rem', background: theme.accent, color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                                        Create Your First Project
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    {projects.slice(0, 5).map((p, i) => (
                                        <div key={p._id} style={{ borderBottom: i < Math.min(projects.length, 5) - 1 ? `1px solid ${theme.borderLight}` : 'none', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                                                <Link to={`/projects/${p._id}`} style={{ flexShrink: 0 }}>
                                                    <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', background: theme.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {p.image ? (
                                                            <img src={getMediaUrl(p.image)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <i className="fas fa-project-diagram" style={{ fontSize: '1.2rem', color: theme.accentText }}></i>
                                                        )}
                                                    </div>
                                                </Link>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h3 style={{ fontWeight: '600', fontSize: '1rem' }}>
                                                        <Link to={`/projects/${p._id}`} style={{ color: theme.text, textDecoration: 'none' }}
                                                            onMouseEnter={e => e.currentTarget.style.color = theme.accentText}
                                                            onMouseLeave={e => e.currentTarget.style.color = theme.text}>
                                                            {p.name}
                                                        </Link>
                                                    </h3>
                                                    <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: theme.textFaint }}>
                                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                            <span><i className="far fa-calendar-alt" style={{ marginRight: '0.25rem' }}></i>{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            <span><i className="fas fa-users" style={{ marginRight: '0.25rem' }}></i>{p.members?.length || 0} Members</span>
                                                        </div>
                                                        <Link to={`/projects/${p._id}`} style={{ color: theme.accentText, textDecoration: 'none', fontWeight: '500', fontSize: '0.8rem' }}>
                                                            View Details <i className="fas fa-chevron-right" style={{ marginLeft: '0.2rem', fontSize: '0.7rem' }}></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Resources */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: theme.text }}>Recent Resources</h2>
                                <Link to="/resources" style={{ color: theme.accentText, textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}>
                                    View All <i className="fas fa-chevron-right" style={{ marginLeft: '0.2rem', fontSize: '0.7rem' }}></i>
                                </Link>
                            </div>
                            {resources.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', background: theme.bgCardHover, borderRadius: '8px' }}>
                                    <div style={{ display: 'inline-block', padding: '1rem', borderRadius: '50%', background: theme.successBg, marginBottom: '0.75rem' }}>
                                        <i className="fas fa-box-open" style={{ fontSize: '2rem', color: theme.success }}></i>
                                    </div>
                                    <h3 style={{ fontWeight: '500', marginBottom: '0.5rem', color: theme.text }}>No resources yet</h3>
                                    <p style={{ color: theme.textFaint, fontSize: '0.9rem', marginBottom: '0.75rem' }}>Start sharing knowledge by uploading your first resource.</p>
                                    <Link to="/create-resource" style={{ display: 'inline-block', background: '#059669', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>
                                        <i className="fas fa-plus" style={{ marginRight: '0.3rem' }}></i>Add Your First Resource
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {resources.slice(0, 5).map(r => (
                                        <div key={r._id} style={{ border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '1rem', transition: 'all 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.boxShadow = theme.shadowHover}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: theme.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <i className={typeIcons[r.type] || 'fas fa-file-alt'} style={{ fontSize: '1.2rem', color: theme.accentText }}></i>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ fontWeight: '600', color: theme.text, marginBottom: '0.2rem' }}>{r.title}</h3>
                                                    <p style={{ color: theme.textFaint, fontSize: '0.8rem' }}>
                                                        <span><i className="fas fa-user" style={{ marginRight: '0.2rem' }}></i>{r.uploadedBy?.fullName || 'Unknown'}</span>
                                                    </p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                                                        <span style={{ background: theme.accentLight, color: theme.accentText, fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: '500' }}>{r.type || 'document'}</span>
                                                        <Link to={`/resources/${r._id}`} style={{ color: theme.accentText, textDecoration: 'none', fontSize: '0.8rem', fontWeight: '500' }}>
                                                            View Details <i className="fas fa-chevron-right" style={{ marginLeft: '0.2rem', fontSize: '0.65rem' }}></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Profile Card */}
                        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1rem' }}>
                                {profileImageUrl ? (
                                    <img src={profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: theme.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fas fa-user" style={{ fontSize: '2.5rem', color: theme.accentText }}></i>
                                    </div>
                                )}
                            </div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.25rem', color: theme.text }}>{user?.fullName || user?.username}</h2>
                            <p style={{ color: theme.textFaint, fontSize: '0.85rem' }}>{user?.userType === 'community_admin' ? 'Community Admin' : user?.userType === 'system_admin' ? 'System Admin' : 'Individual Member'}</p>
                            <div style={{ marginTop: '1rem', width: '100%' }}>
                                <Link to="/profile" style={{ display: 'block', width: '100%', background: theme.accent, color: '#fff', padding: '0.6rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        {/* Connected Platforms */}
                        <PlatformLinksWidget socialLinks={user?.socialLinks} theme={theme} showStats={true} />

                        {/* Quick Actions */}
                        <div style={card}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: theme.text }}>Quick Actions</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {[
                                    { to: '/create-project', icon: 'fas fa-plus', bg: theme.accentLight, ic: theme.accentText, label: 'New Project', sub: 'Create a new project' },
                                    { to: '/create-resource', icon: 'fas fa-file-alt', bg: theme.successBg, ic: theme.success, label: 'Add Resource', sub: 'Share a new resource' },
                                    { to: '/communities', icon: 'fas fa-search', bg: theme.name === 'dark' ? '#2e1065' : '#f5f3ff', ic: '#7c3aed', label: 'Find Communities', sub: 'Join a new community' },
                                ].map(a => (
                                    <Link key={a.to} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: a.bg, borderRadius: '8px', textDecoration: 'none', color: theme.text, transition: 'opacity 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: theme.bgOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className={a.icon} style={{ color: a.ic, fontSize: '0.8rem' }}></i>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{a.label}</div>
                                            <div style={{ color: theme.textFaint, fontSize: '0.7rem' }}>{a.sub}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Communities */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: theme.text }}>Communities</h2>
                                <Link to="/communities" style={{ color: theme.accentText, textDecoration: 'none', fontSize: '0.8rem', fontWeight: '500' }}>View All</Link>
                            </div>
                            {communities.length === 0 ? (
                                <p style={{ color: theme.textFaint, fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                                    No communities yet. <Link to="/communities" style={{ color: theme.accentText }}>Join one!</Link>
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {communities.slice(0, 5).map(c => (
                                        <Link key={c._id} to={`/communities/${c._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '6px', textDecoration: 'none', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = theme.bgCardHover}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <div style={{ width: '32px', height: '32px', background: theme.accentLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                                {c.image ? (
                                                    <img src={c.image.startsWith('http') ? c.image : getMediaUrl(c.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <i className="fas fa-users" style={{ fontSize: '0.7rem', color: theme.accentText }}></i>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500', fontSize: '0.9rem', color: theme.text }}>{c.name}</div>
                                                <div style={{ color: theme.textFaint, fontSize: '0.7rem' }}>{c.location || 'Global'}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
