import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/useTheme';
import api from '../api/api';

const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
    { key: 'projects', label: 'Projects', icon: 'fas fa-project-diagram' },
    { key: 'resources', label: 'Resources', icon: 'fas fa-book-open' },
    { key: 'users', label: 'Users', icon: 'fas fa-users' },
];

const STATUS_COLORS = {
    planning: '#8b5cf6',
    active: '#10b981',
    in_progress: '#f59e0b',
    completed: '#06b6d4',
    on_hold: '#ef4444',
};

const RESOURCE_TYPE_COLORS = {
    document: '#6366f1',
    link: '#06b6d4',
    video: '#ec4899',
    image: '#10b981',
    code: '#f59e0b',
    other: '#6b7280',
};

const ROLE_LABELS = {
    individual: 'Individual',
    community_admin: 'Community Admin',
    system_admin: 'System Admin',
};

const ROLE_COLORS = {
    individual: '#6366f1',
    community_admin: '#f59e0b',
    system_admin: '#ef4444',
};

export default function AdminPanel() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [resources, setResources] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [featuredFilter, setFeaturedFilter] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (_err) { showToast(_err.response?.data?.message || 'Failed to load stats', 'error'); }
    }, []);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (statusFilter) params.status = statusFilter;
            if (featuredFilter) params.featured = featuredFilter;
            const { data } = await api.get('/admin/projects', { params });
            setProjects(data);
        } catch (_err) { showToast(_err.response?.data?.message || 'Failed to load projects', 'error'); }
        setLoading(false);
    }, [searchTerm, statusFilter, featuredFilter]);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (typeFilter) params.type = typeFilter;
            const { data } = await api.get('/admin/resources', { params });
            setResources(data);
        } catch (_err) { showToast(_err.response?.data?.message || 'Failed to load resources', 'error'); }
        setLoading(false);
    }, [searchTerm, typeFilter]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            const { data } = await api.get('/admin/users', { params });
            setUsers(data);
        } catch (_err) { showToast(_err.response?.data?.message || 'Failed to load users', 'error'); }
        setLoading(false);
    }, [searchTerm]);

    useEffect(() => { const id = setTimeout(fetchStats, 0); return () => clearTimeout(id); }, [fetchStats]);

    useEffect(() => {
        const id = setTimeout(() => {
            setSearchTerm('');
            setStatusFilter('');
            setTypeFilter('');
            setFeaturedFilter('');
            if (activeTab === 'projects') fetchProjects();
            else if (activeTab === 'resources') fetchResources();
            else if (activeTab === 'users') fetchUsers();
            else if (activeTab === 'dashboard') fetchStats();
        }, 0);
        return () => clearTimeout(id);
    }, [activeTab, fetchProjects, fetchResources, fetchStats, fetchUsers]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'projects') fetchProjects();
            else if (activeTab === 'resources') fetchResources();
            else if (activeTab === 'users') fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, typeFilter, featuredFilter, activeTab, fetchProjects, fetchResources, fetchUsers]);

    // ─── Actions ───
    const toggleFeatured = async (id) => {
        try {
            const { data } = await api.put(`/admin/projects/${id}/feature`);
            showToast(data.message);
            fetchProjects();
        } catch (_err) { showToast(_err.response?.data?.message || 'Failed', 'error'); }
    };

    const changeProjectStatus = async (id, status) => {
        try {
            const { data } = await api.put(`/admin/projects/${id}/status`, { status });
            showToast(data.message);
            fetchProjects();
        } catch (_err) { showToast(_err.response?.data?.message || 'Failed', 'error'); }
    };

    const deleteProject = async (id, name) => {
        if (!window.confirm(`Delete project "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/projects/${id}`);
            showToast('Project deleted');
            fetchProjects();
            fetchStats();
        } catch (_err) { showToast(_err.response?.data?.message || 'Failed', 'error'); }
    };

    const deleteResource = async (id, title) => {
        if (!window.confirm(`Delete resource "${title}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/resources/${id}`);
            showToast('Resource deleted');
            fetchResources();
            fetchStats();
        } catch (_err) { showToast(_err.response?.data?.message || 'Failed', 'error'); }
    };

    const changeUserRole = async (id, userType) => {
        try {
            const { data } = await api.put(`/admin/users/${id}/role`, { userType });
            showToast(data.message);
            fetchUsers();
        } catch (_err) { showToast(_err.response?.data?.message || 'Failed', 'error'); }
    };

    // ─── Styles ───
    const pageStyle = { minHeight: '100vh', background: theme.bg, padding: '0' };

    const headerStyle = {
        background: theme.heroBg, padding: '2.5rem 1rem 1.5rem', color: '#fff',
    };
    const headerInner = { maxWidth: '1300px', margin: '0 auto' };

    const containerStyle = { maxWidth: '1300px', margin: '0 auto', padding: '0 1rem 2rem' };

    const tabBarStyle = {
        display: 'flex', gap: '0.25rem', background: theme.bgCard, borderRadius: '12px',
        padding: '0.35rem', margin: '-1.5rem auto 1.5rem', maxWidth: '600px',
        boxShadow: theme.shadowLg, border: `1px solid ${theme.border}`,
        position: 'relative', zIndex: 2,
    };
    const tabStyle = (isActive) => ({
        flex: 1, padding: '0.65rem 0.5rem', border: 'none', borderRadius: '10px', cursor: 'pointer',
        fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
        transition: 'all 0.2s',
        background: isActive ? theme.accent : 'transparent',
        color: isActive ? '#fff' : theme.textMuted,
    });

    const cardStyle = {
        background: theme.bgCard, borderRadius: '14px', border: `1px solid ${theme.border}`,
        boxShadow: theme.shadow, overflow: 'hidden',
    };

    const searchBarStyle = {
        display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap',
    };
    const inputStyle = {
        flex: '1 1 220px', padding: '0.6rem 1rem', borderRadius: '10px',
        border: `1px solid ${theme.border}`, background: theme.bgInput, color: theme.text,
        fontSize: '0.9rem', outline: 'none',
    };
    const selectStyle = {
        ...inputStyle, flex: '0 1 180px', cursor: 'pointer',
    };

    const tableStyle = { width: '100%', borderCollapse: 'collapse' };
    const thStyle = {
        padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted,
        borderBottom: `2px solid ${theme.border}`, background: theme.bgOverlay,
    };
    const tdStyle = {
        padding: '0.75rem 1rem', borderBottom: `1px solid ${theme.borderLight}`,
        fontSize: '0.9rem', color: theme.text, verticalAlign: 'middle',
    };

    const badgeStyle = (color) => ({
        display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '20px',
        fontSize: '0.7rem', fontWeight: '700', color: '#fff', background: color,
        textTransform: 'capitalize',
    });

    const btnSmall = (color) => ({
        padding: '0.35rem 0.7rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontSize: '0.8rem', fontWeight: '600', color: '#fff', background: color,
        transition: 'opacity 0.2s',
    });

    const starBtn = (isFeatured) => ({
        padding: '0.35rem 0.6rem', borderRadius: '8px', border: isFeatured ? '2px solid #f59e0b' : `1px solid ${theme.border}`,
        cursor: 'pointer', background: isFeatured ? '#fef3c7' : 'transparent',
        color: isFeatured ? '#f59e0b' : theme.textFaint, fontSize: '1rem',
        transition: 'all 0.2s',
    });

    const emptyStyle = {
        padding: '3rem', textAlign: 'center', color: theme.textMuted, fontSize: '0.95rem',
    };

    // ─── Stat Card ───
    const StatCard = ({ icon, label, value, color, sub }) => (
        <div style={{
            background: theme.bgCard, borderRadius: '14px', padding: '1.25rem 1.5rem',
            border: `1px solid ${theme.border}`, boxShadow: theme.shadow,
            display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 200px',
            transition: 'transform 0.2s, box-shadow 0.2s',
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = theme.shadowHover; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.shadow; }}
        >
            <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <i className={icon} style={{ fontSize: '1.25rem', color }} />
            </div>
            <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: theme.text }}>{value ?? '—'}</div>
                <div style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: '500' }}>{label}</div>
                {sub && <div style={{ fontSize: '0.7rem', color: theme.textFaint, marginTop: '2px' }}>{sub}</div>}
            </div>
        </div>
    );

    // ─── Dashboard Tab ───
    const renderDashboard = () => {
        if (!stats) return <div style={emptyStyle}>Loading stats...</div>;

        const statusData = stats.projectsByStatus || [];
        const typeData = stats.resourcesByType || [];

        return (
            <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <StatCard icon="fas fa-users" label="Total Users" value={stats.users} color="#6366f1" sub={`${stats.recentSignups} new this month`} />
                    <StatCard icon="fas fa-project-diagram" label="Total Projects" value={stats.projects} color="#10b981" sub={`${stats.featuredProjects} featured`} />
                    <StatCard icon="fas fa-book-open" label="Total Resources" value={stats.resources} color="#f59e0b" />
                    <StatCard icon="fas fa-people-group" label="Communities" value={stats.communities} color="#ec4899" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {/* Projects by Status */}
                    <div style={cardStyle}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${theme.border}` }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: theme.text }}>
                                <i className="fas fa-chart-pie" style={{ color: theme.accent, marginRight: '0.5rem' }} /> Projects by Status
                            </h3>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            {statusData.length === 0 ? <p style={{ color: theme.textMuted }}>No data</p> : statusData.map(s => (
                                <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS[s._id] || '#6b7280' }} />
                                        <span style={{ color: theme.text, fontSize: '0.9rem', textTransform: 'capitalize' }}>{(s._id || 'unknown').replace('_', ' ')}</span>
                                    </div>
                                    <span style={badgeStyle(STATUS_COLORS[s._id] || '#6b7280')}>{s.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resources by Type */}
                    <div style={cardStyle}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${theme.border}` }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: theme.text }}>
                                <i className="fas fa-layer-group" style={{ color: theme.accent, marginRight: '0.5rem' }} /> Resources by Type
                            </h3>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            {typeData.length === 0 ? <p style={{ color: theme.textMuted }}>No data</p> : typeData.map(t => (
                                <div key={t._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: RESOURCE_TYPE_COLORS[t._id] || '#6b7280' }} />
                                        <span style={{ color: theme.text, fontSize: '0.9rem', textTransform: 'capitalize' }}>{t._id || 'unknown'}</span>
                                    </div>
                                    <span style={badgeStyle(RESOURCE_TYPE_COLORS[t._id] || '#6b7280')}>{t.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ─── Projects Tab ───
    const renderProjects = () => (
        <div>
            <div style={searchBarStyle}>
                <input
                    style={inputStyle}
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select style={selectStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    {Object.keys(STATUS_COLORS).map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                </select>
                <select style={selectStyle} value={featuredFilter} onChange={e => setFeaturedFilter(e.target.value)}>
                    <option value="">All</option>
                    <option value="true">Featured</option>
                    <option value="false">Not Featured</option>
                </select>
            </div>

            <div style={cardStyle}>
                {loading ? <div style={emptyStyle}>Loading...</div> : projects.length === 0 ? <div style={emptyStyle}>No projects found</div> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Project</th>
                                    <th style={thStyle}>Owner</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Members</th>
                                    <th style={thStyle}>Featured</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map(p => (
                                    <tr key={p._id}
                                        onMouseEnter={e => e.currentTarget.style.background = theme.bgOverlay}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {p.image ? (
                                                    <img src={`${api.defaults.baseURL?.replace('/api', '')}${p.image}`} alt=""
                                                        style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: `${theme.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className="fas fa-folder" style={{ color: theme.accent, fontSize: '0.9rem' }} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '600', color: theme.text }}>{p.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: theme.textFaint }}>
                                                        {p.communityId?.name || 'Independent'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: '0.85rem' }}>{p.createdBy?.fullName || p.createdBy?.username || '—'}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <select
                                                value={p.status}
                                                onChange={e => changeProjectStatus(p._id, e.target.value)}
                                                style={{
                                                    ...badgeStyle(STATUS_COLORS[p.status] || '#6b7280'),
                                                    border: 'none', cursor: 'pointer', paddingRight: '1.2rem',
                                                    appearance: 'auto', fontSize: '0.75rem',
                                                }}
                                            >
                                                {Object.keys(STATUS_COLORS).map(s => (
                                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ color: theme.textSecondary }}>{p.memberCount || 0}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <button style={starBtn(p.isFeatured)} onClick={() => toggleFeatured(p._id)}
                                                title={p.isFeatured ? 'Remove from featured' : 'Mark as featured'}>
                                                <i className={p.isFeatured ? 'fas fa-star' : 'far fa-star'} />
                                            </button>
                                        </td>
                                        <td style={tdStyle}>
                                            <button style={btnSmall('#ef4444')} onClick={() => deleteProject(p._id, p.name)}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                <i className="fas fa-trash" style={{ marginRight: '0.3rem' }} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    // ─── Resources Tab ───
    const renderResources = () => (
        <div>
            <div style={searchBarStyle}>
                <input
                    style={inputStyle}
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select style={selectStyle} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    {Object.keys(RESOURCE_TYPE_COLORS).map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            <div style={cardStyle}>
                {loading ? <div style={emptyStyle}>Loading...</div> : resources.length === 0 ? <div style={emptyStyle}>No resources found</div> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Resource</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Uploaded By</th>
                                    <th style={thStyle}>Downloads</th>
                                    <th style={thStyle}>Public</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map(r => (
                                    <tr key={r._id}
                                        onMouseEnter={e => e.currentTarget.style.background = theme.bgOverlay}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={tdStyle}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: theme.text }}>{r.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: theme.textFaint, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {r.description}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={badgeStyle(RESOURCE_TYPE_COLORS[r.type] || '#6b7280')}>{r.type}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: '0.85rem' }}>{r.uploadedBy?.fullName || r.uploadedBy?.username || '—'}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ color: theme.textSecondary }}>{r.downloadCount || 0}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            {r.isPublic ? (
                                                <i className="fas fa-globe" style={{ color: '#10b981' }} title="Public" />
                                            ) : (
                                                <i className="fas fa-lock" style={{ color: theme.textFaint }} title="Private" />
                                            )}
                                        </td>
                                        <td style={tdStyle}>
                                            <button style={btnSmall('#ef4444')} onClick={() => deleteResource(r._id, r.title)}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                <i className="fas fa-trash" style={{ marginRight: '0.3rem' }} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    // ─── Users Tab ───
    const renderUsers = () => (
        <div>
            <div style={searchBarStyle}>
                <input
                    style={inputStyle}
                    placeholder="Search users by name, username, or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div style={cardStyle}>
                {loading ? <div style={emptyStyle}>Loading...</div> : users.length === 0 ? <div style={emptyStyle}>No users found</div> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>User</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Role</th>
                                    <th style={thStyle}>Joined</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}
                                        onMouseEnter={e => e.currentTarget.style.background = theme.bgOverlay}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {u.profileImage ? (
                                                    <img src={`${api.defaults.baseURL?.replace('/api', '')}${u.profileImage}`} alt=""
                                                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${theme.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className="fas fa-user" style={{ color: theme.accent, fontSize: '0.8rem' }} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '600', color: theme.text }}>{u.fullName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: theme.textFaint }}>@{u.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: '0.85rem', color: theme.textSecondary }}>{u.email}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={badgeStyle(ROLE_COLORS[u.userType] || '#6b7280')}>
                                                {ROLE_LABELS[u.userType] || u.userType}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: '0.85rem', color: theme.textMuted }}>
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <select
                                                value={u.userType}
                                                onChange={e => changeUserRole(u._id, e.target.value)}
                                                style={{
                                                    padding: '0.3rem 0.5rem', borderRadius: '8px',
                                                    border: `1px solid ${theme.border}`, background: theme.bgInput,
                                                    color: theme.text, fontSize: '0.8rem', cursor: 'pointer',
                                                }}
                                            >
                                                <option value="individual">Individual</option>
                                                <option value="community_admin">Community Admin</option>
                                                <option value="system_admin">System Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={pageStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={headerInner}>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                        <i className="fas fa-shield-alt" style={{ marginRight: '0.75rem', opacity: 0.9 }} />
                        Admin Panel
                    </h1>
                    <p style={{ margin: '0.35rem 0 0', opacity: 0.8, fontSize: '0.95rem' }}>
                        Manage projects, resources, and users across the platform
                    </p>
                </div>
            </div>

            {/* Tab Bar */}
            <div style={containerStyle}>
                <div style={tabBarStyle}>
                    {TABS.map(t => (
                        <button key={t.key} style={tabStyle(activeTab === t.key)}
                            onClick={() => setActiveTab(t.key)}
                            onMouseEnter={e => { if (activeTab !== t.key) e.currentTarget.style.background = theme.bgOverlay; }}
                            onMouseLeave={e => { if (activeTab !== t.key) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <i className={t.icon} style={{ fontSize: '0.8rem' }} />
                            <span className="admin-tab-label">{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'projects' && renderProjects()}
                {activeTab === 'resources' && renderResources()}
                {activeTab === 'users' && renderUsers()}
            </div>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
                    padding: '0.85rem 1.5rem', borderRadius: '12px',
                    background: toast.type === 'error' ? '#ef4444' : '#10b981',
                    color: '#fff', fontWeight: '600', fontSize: '0.9rem',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    animation: 'slideUp 0.3s ease',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                    <i className={toast.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'} />
                    {toast.message}
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (max-width: 768px) {
                    .admin-tab-label { display: none; }
                }
            `}</style>
        </div>
    );
}
