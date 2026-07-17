import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import api from '../api/api';

export default function Resources() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [resources, setResources] = useState([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/resources').then(r => setResources(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const filtered = resources.filter(r => {
        const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || (r.description || '').toLowerCase().includes(search.toLowerCase());
        const matchType = !typeFilter || r.type === typeFilter;
        return matchSearch && matchType;
    });

    const typeIcons = { document: 'fas fa-file-alt', link: 'fas fa-link', video: 'fas fa-video', image: 'fas fa-image', other: 'fas fa-file' };
    const typeColors = { document: '#4f46e5', link: '#0891b2', video: '#dc2626', image: '#059669', other: '#6b7280' };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg }}>
            <div style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)', color: '#fff', padding: '3rem 1rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Resource Library</h1>
                <p style={{ opacity: 0.85, fontSize: '1.05rem', marginBottom: '1.5rem' }}>Browse and share knowledge with your communities</p>
                <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '0.75rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..."
                            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', border: 'none', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', background: theme.bgInput, color: theme.text }} />
                    </div>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                        style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: 'none', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', minWidth: '140px', background: theme.bgInput, color: theme.text }}>
                        <option value="">All Types</option>
                        <option value="document">Documents</option>
                        <option value="link">Links</option>
                        <option value="video">Videos</option>
                        <option value="image">Images</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <p style={{ color: theme.textMuted }}>{filtered.length} resources found</p>
                    {user && (
                        <Link to="/create-resource" style={{ background: '#0891b2', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                            <i className="fas fa-plus" style={{ marginRight: '0.4rem' }}></i>Add Resource
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0891b2' }}></i></div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: theme.textFaint }}>
                        <i className="fas fa-folder-open" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                        <p style={{ fontSize: '1.1rem' }}>No resources found.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                        {filtered.map(r => {
                            const icon = typeIcons[r.type] || typeIcons.other;
                            const color = typeColors[r.type] || typeColors.other;
                            return (
                                <Link key={r._id} to={`/resources/${r._id}`} style={{
                                    background: theme.bgCard, borderRadius: '14px', padding: '1.5rem', boxShadow: theme.shadow,
                                    textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'transform 0.2s',
                                    border: `1px solid ${theme.border}`
                                }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ width: '50px', height: '50px', background: `${color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className={icon} style={{ color, fontSize: '1.2rem' }}></i>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.3rem', fontSize: '1rem' }}>{r.title}</h3>
                                        <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: '1.5' }} className="line-clamp-2">{r.description}</p>
                                        <div style={{ display: 'flex', gap: '1rem', color: theme.textFaint, fontSize: '0.75rem' }}>
                                            <span><i className="fas fa-download" style={{ marginRight: '0.3rem' }}></i>{r.downloadCount || 0}</span>
                                            <span style={{ background: `${color}15`, color, padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>{r.type || 'other'}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
