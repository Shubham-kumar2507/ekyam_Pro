import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';

export default function Communities() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [communities, setCommunities] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/communities').then(r => setCommunities(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const filtered = communities.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = !categoryFilter || c.category === categoryFilter;
        return matchSearch && matchCat;
    });

    const categories = [...new Set(communities.map(c => c.category).filter(Boolean))];


    return (
        <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            {/* Header */}
            <header style={{ background: theme.navBg, color: '#fff', padding: '3rem 1rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Discover Communities</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.85, maxWidth: '700px' }}>Connect with diverse communities sharing resources, knowledge, and collaborating on meaningful projects.</p>
                </div>
            </header>

            {/* Filter Section */}
            <section style={{ background: theme.bgCard, padding: '1.5rem 1rem', boxShadow: theme.shadow, borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', color: theme.textSecondary, marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '500' }}>Search</label>
                        <div style={{ position: 'relative' }}>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search communities"
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: theme.bgInput, color: theme.text }} />
                            <i className="fas fa-search" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: theme.textFaint }}></i>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', color: theme.textSecondary, marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '500' }}>Category</label>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: `1px solid ${theme.border}`, borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: theme.bgInput, color: theme.text }}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div></div>
                    {user && (
                        <Link to="/create-community" style={{ background: theme.accent, color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            Create a Community
                        </Link>
                    )}
                </div>
            </section>

            {/* Grid */}
            <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
                {search || categoryFilter ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: theme.text }}>
                            Showing results{search ? ` for "${search}"` : ''}{categoryFilter ? ` in ${categoryFilter}` : ''}
                        </h2>
                        <button onClick={() => { setSearch(''); setCategoryFilter(''); }} style={{ color: theme.accentText, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <i className="fas fa-times" style={{ marginRight: '0.3rem' }}></i>Clear filters
                        </button>
                    </div>
                ) : null}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: theme.accent }}></i></div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <i className="fas fa-search" style={{ fontSize: '3rem', color: theme.textFaint, display: 'block', marginBottom: '1rem' }}></i>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: theme.text }}>No communities found</h3>
                        <p style={{ color: theme.textMuted }}>Try adjusting your filters or search criteria</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {filtered.map(c => (
                            <div key={c._id} style={{ background: theme.bgCard, borderRadius: '8px', overflow: 'hidden', border: `1px solid ${theme.border}`, transition: 'box-shadow 0.3s' }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = theme.shadowHover}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                                {c.image ? (
                                    <img src={c.image.startsWith('http') ? c.image : getMediaUrl(c.image)} alt={c.name} style={{ width: '100%', height: '192px', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '192px', background: theme.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fas fa-users" style={{ fontSize: '3rem', color: '#a5b4fc' }}></i>
                                    </div>
                                )}
                                <div style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        {c.category ? (
                                            <span style={{ background: theme.accentLight, color: theme.accentText, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>{c.category}</span>
                                        ) : <span></span>}
                                        <span style={{ color: theme.textFaint, fontSize: '0.8rem' }}>
                                            <i className="fas fa-map-marker-alt" style={{ marginRight: '0.25rem' }}></i>{c.location || 'Global'}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.4rem', color: theme.text }}>{c.name}</h3>
                                    <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
                                            <i className="fas fa-users" style={{ marginRight: '0.3rem', color: theme.textFaint }}></i>{(c.memberCount || 0) + 1} members
                                        </span>
                                        <Link to={`/communities/${c._id}`} style={{ color: theme.accentText, textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>View Details</Link>
                                    </div>
                                    <div style={{ borderTop: `1px solid ${theme.borderLight}`, paddingTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '28px', height: '28px', background: theme.accentLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className="fas fa-user" style={{ fontSize: '0.65rem', color: theme.accentText }}></i>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: theme.textFaint }}>Admin: {c.adminId?.fullName || c.adminId?.username || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA */}
            <section style={{ background: theme.accentLight, padding: '4rem 1rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', color: theme.text }}>Can't find your community?</h2>
                <p style={{ color: theme.textSecondary, fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                    Create your own community on EKYAM and connect with like-minded individuals, share resources, and collaborate on projects that matter.
                </p>
                <Link to={user ? "/create-community" : "/login"} style={{ display: 'inline-block', background: theme.accent, color: '#fff', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}>
                    Create a Community
                </Link>
            </section>
        </div>
    );
}
