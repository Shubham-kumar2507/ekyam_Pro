import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';

export default function CommunityDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [community, setCommunity] = useState(null);
    const [stats, setStats] = useState({ members: 0, projects: 0, resources: 0, active_members: 0 });
    const [activities, setActivities] = useState([]);
    const [events, setEvents] = useState([]);
    const [projects, setProjects] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventForm, setEventForm] = useState({ title: '', description: '', startDate: '', endDate: '', location: '', eventType: 'meeting' });
    const [calMonth, setCalMonth] = useState(new Date());

    // Edit community modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '', location: '', category: '' });
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [editSaving, setEditSaving] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [cRes, sRes, aRes, eRes, pRes, rRes] = await Promise.allSettled([
                    api.get(`/communities/${id}`),
                    api.get(`/communities/${id}/stats`),
                    api.get(`/communities/${id}/activity`),
                    api.get(`/events/${id}/events`),
                    api.get(`/projects?communityId=${id}`),
                    api.get(`/resources?communityId=${id}`),
                ]);
                if (cRes.status === 'fulfilled') {
                    const c = cRes.value.data;
                    setCommunity(c);
                    const isAdmin = c.adminId?._id === user?._id || c.adminId === user?._id;
                    if (!isAdmin) { navigate(`/communities/${id}`); return; }
                }
                if (sRes.status === 'fulfilled') setStats(sRes.value.data);
                if (aRes.status === 'fulfilled') setActivities(aRes.value.data);
                if (eRes.status === 'fulfilled') setEvents(eRes.value.data);
                if (pRes.status === 'fulfilled') setProjects(pRes.value.data);
                if (rRes.status === 'fulfilled') setResources(rRes.value.data);
            } catch { /* silently ignore */ }
            setLoading(false);
        };
        fetchAll();
    }, [id, navigate, user]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/events/${id}/events`, eventForm);
            setEvents(prev => [...prev, res.data].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
            setShowEventModal(false);
            setEventForm({ title: '', description: '', startDate: '', endDate: '', location: '', eventType: 'meeting' });
        } catch { /* silently ignore */ }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Delete this event?')) return;
        try {
            await api.delete(`/events/${id}/events/${eventId}`);
            setEvents(prev => prev.filter(e => e._id !== eventId));
        } catch { /* silently ignore */ }
    };

    const imgUrl = (img) => getMediaUrl(img);

    // Edit community handlers
    const openEditModal = () => {
        setEditForm({
            name: community.name || '',
            description: community.description || '',
            location: community.location || '',
            category: community.category || '',
        });
        setEditImagePreview(community.image ? (community.image.startsWith('http') ? community.image : getMediaUrl(community.image)) : null);
        setEditImageFile(null);
        setShowEditModal(true);
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setEditImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        setEditSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editForm.name);
            formData.append('description', editForm.description);
            formData.append('location', editForm.location);
            formData.append('category', editForm.category);
            if (editImageFile) formData.append('image', editImageFile);
            const { data } = await api.put(`/communities/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCommunity(prev => ({ ...prev, ...data }));
            setShowEditModal(false);
        } catch (_err) { alert(_err.response?.data?.message || 'Error updating community'); }
        setEditSaving(false);
    };

    // Calendar helpers
    const calYear = calMonth.getFullYear();
    const calMon = calMonth.getMonth();
    const firstDay = new Date(calYear, calMon, 1).getDay();
    const daysInMonth = new Date(calYear, calMon + 1, 0).getDate();
    const today = new Date();
    const isToday = (d) => d === today.getDate() && calMon === today.getMonth() && calYear === today.getFullYear();
    const eventDays = new Set(events.filter(ev => {
        const d = new Date(ev.startDate);
        return d.getMonth() === calMon && d.getFullYear() === calYear;
    }).map(ev => new Date(ev.startDate).getDate()));

    const prevMonth = () => setCalMonth(new Date(calYear, calMon - 1, 1));
    const nextMonth = () => setCalMonth(new Date(calYear, calMon + 1, 1));

    const participation = stats.members > 0 ? Math.round((stats.active_members / stats.members) * 100) : 0;

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#3c6e71' }}></i></div>;
    if (!community) return null;

    const card = { background: '#fff', border: '1px solid #d4c9b0', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
    const headerStyle = { background: 'linear-gradient(135deg, #3c6e71, #284b63)', color: '#fff', padding: '1.25rem 1.5rem', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' };
    const sideItem = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '4px', textDecoration: 'none', color: '#374151', transition: 'all 0.2s', cursor: 'pointer' };

    const typeIcons = { document: 'fas fa-file-alt', link: 'fas fa-link', video: 'fas fa-video', image: 'fas fa-image', code: 'fas fa-code', other: 'fas fa-file' };

    return (
        <div style={{ background: '#f8f5f1', minHeight: '100vh', fontFamily: "'Libre Baskerville', Georgia, serif", color: '#2c3e50' }}>
            {/* Header Card */}
            <div style={{ ...card, padding: '2rem', maxWidth: '1200px', margin: '0 auto', marginTop: '2rem', marginBottom: '2rem', marginLeft: 'auto', marginRight: 'auto' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #d4c9b0', overflow: 'hidden', flexShrink: 0 }}>
                                {community.image ? <img src={imgUrl(community.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <div style={{ width: '100%', height: '100%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-users" style={{ fontSize: '2rem', color: '#6366f1' }}></i></div>}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '2rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '0.25rem' }}>{community.name}</h1>
                                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>{community.location || 'Global'} • Founded {new Date(community.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                        <Link to={`/communities/${id}`} style={{ background: '#3c6e71', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}>
                            <i className="fas fa-arrow-left" style={{ marginRight: '0.4rem' }}></i>Back to Community
                        </Link>
                    </div>
                    <div style={{ height: '2px', background: 'linear-gradient(to right, transparent, #d4c9b0, transparent)', margin: '1.5rem 0' }}></div>
                    <p style={{ color: '#4b5563', fontStyle: 'italic' }}>{community.description}</p>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 2rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    {/* Sidebar */}
                    <div style={{ width: '280px', flexShrink: 0 }}>
                        {/* Admin Controls */}
                        <div style={{ ...card, marginBottom: '2rem' }}>
                            <div style={headerStyle}><h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>Admin Controls</h2></div>
                            <div style={{ padding: '1rem' }}>
                                {[
                                    { action: 'edit', icon: 'fas fa-edit', label: 'Edit Community Details' },
                                    { to: `/create-project`, icon: 'fas fa-plus-circle', label: 'Create New Project' },
                                    { to: `/create-resource`, icon: 'fas fa-upload', label: 'Upload Resource' },
                                    { to: `/communities/${id}/members`, icon: 'fas fa-users-cog', label: 'Manage Members' },
                                    { to: `/communities/${id}/chat`, icon: 'fas fa-comments', label: 'Community Chat' },
                                ].map(a => (
                                    a.action === 'edit' ? (
                                        <div key={a.label} style={sideItem} onClick={openEditModal}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#f0e6d2'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}>
                                            <i className={a.icon} style={{ color: '#374151', width: '20px', textAlign: 'center' }}></i>
                                            <span>{a.label}</span>
                                        </div>
                                    ) : (
                                        <Link key={a.label} to={a.to} style={sideItem}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#f0e6d2'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}>
                                            <i className={a.icon} style={{ color: '#374151', width: '20px', textAlign: 'center' }}></i>
                                            <span>{a.label}</span>
                                        </Link>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* Member Insights */}
                        <div style={card}>
                            <div style={headerStyle}><h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>Member Insights</h2></div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>Active participation rate:</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ flex: 1, background: '#e5e7eb', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
                                            <div style={{ width: `${participation}%`, height: '100%', borderRadius: '999px', background: participation >= 70 ? '#22c55e' : participation >= 40 ? '#eab308' : '#ef4444', transition: 'width 0.5s' }}></div>
                                        </div>
                                        <span style={{ fontWeight: '700', fontSize: '1.1rem', minWidth: '3rem' }}>{participation}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{ flex: 1 }}>
                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                            {[
                                { label: 'Members', value: stats.members, icon: 'fas fa-users', bg: '#dbeafe', color: '#2563eb' },
                                { label: 'Projects', value: stats.projects, icon: 'fas fa-project-diagram', bg: '#d1fae5', color: '#059669' },
                                { label: 'Resources', value: stats.resources, icon: 'fas fa-file-alt', bg: '#fef3c7', color: '#d97706' },
                                { label: 'Active Users', value: stats.active_members, icon: 'fas fa-user-check', bg: '#ede9fe', color: '#7c3aed' },
                            ].map(s => (
                                <div key={s.label} style={{ ...card, padding: '2rem', textAlign: 'center', transition: 'transform 0.3s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                        <i className={s.icon} style={{ fontSize: '1.75rem', color: s.color }}></i>
                                    </div>
                                    <p style={{ fontWeight: '700', fontSize: '1.1rem', color: '#374151', marginBottom: '0.5rem' }}>{s.label}</p>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3c6e71', fontFamily: "'Playfair Display', Georgia, serif" }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Active Projects */}
                        <div style={{ ...card, marginBottom: '2rem' }}>
                            <div style={{ ...headerStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>Active Projects</h2>
                                <Link to="/projects" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>View All <i className="fas fa-arrow-right" style={{ marginLeft: '0.25rem' }}></i></Link>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                {projects.length === 0 ? (
                                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No active projects at the moment</p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                        {projects.slice(0, 3).map(p => (
                                            <div key={p._id} style={{ border: '1px solid #d4c9b0', borderRadius: '4px', overflow: 'hidden', transition: 'transform 0.3s' }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                <div style={{ height: '140px', background: '#f3f4f6', position: 'relative' }}>
                                                    {p.image ? <img src={imgUrl(p.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-project-diagram" style={{ fontSize: '2.5rem', color: '#d1d5db' }}></i></div>}
                                                    <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: '#22c55e', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600' }}>In Progress</span>
                                                </div>
                                                <div style={{ padding: '1.25rem' }}>
                                                    <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{p.name}</h3>
                                                    <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}><i className="fas fa-users" style={{ marginRight: '0.25rem' }}></i>{p.members?.length || 0} members</span>
                                                        <Link to={`/projects/${p._id}`} style={{ background: '#3c6e71', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '500' }}>Details</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resources & Activity */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            {/* Trending Resources */}
                            <div style={card}>
                                <div style={headerStyle}><h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>Trending Resources</h2></div>
                                <div style={{ padding: '1.5rem' }}>
                                    {resources.length === 0 ? (
                                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No resources available</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {resources.slice(0, 4).map(r => (
                                                <div key={r._id} style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem', border: '1px solid #d4c9b0', borderRadius: '4px', gap: '0.75rem' }}>
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '6px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <i className={typeIcons[r.type] || 'fas fa-file-alt'} style={{ fontSize: '1.1rem', color: '#2563eb' }}></i>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h3 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{r.title}</h3>
                                                        <p style={{ color: '#6b7280', fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.4rem' }}>{r.description}</p>
                                                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}><i className="fas fa-download" style={{ marginRight: '0.2rem' }}></i>{r.downloadCount || 0} downloads</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                                <Link to="/resources" style={{ background: '#3c6e71', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>View All Resources</Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div style={card}>
                                <div style={headerStyle}><h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>Recent Activity</h2></div>
                                <div style={{ padding: '1.5rem' }}>
                                    {activities.length === 0 ? (
                                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No recent activity</p>
                                    ) : (
                                        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                                            <div style={{ position: 'absolute', left: '5px', top: 0, bottom: 0, width: '1px', background: '#d4c9b0' }}></div>
                                            {activities.map(a => (
                                                <div key={a._id} style={{ position: 'relative', marginBottom: '1.25rem', transition: 'transform 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                                    <div style={{ position: 'absolute', left: '-2rem', top: '4px', width: '10px', height: '10px', background: '#3c6e71', borderRadius: '50%', border: '2px solid #f8f5f1' }}></div>
                                                    <div style={{ border: '1px solid #d4c9b0', borderRadius: '4px', padding: '0.75rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ width: '32px', height: '32px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <i className="fas fa-user" style={{ fontSize: '0.65rem', color: '#4f46e5' }}></i>
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '0.85rem' }}><strong>{a.userId?.fullName || 'Unknown'}</strong> {a.activityType}</p>
                                                                <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{new Date(a.activityDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div style={card}>
                            <div style={{ ...headerStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>Upcoming Events</h2>
                                <button onClick={() => setShowEventModal(true)} style={{ background: '#fff', color: '#3c6e71', border: 'none', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: '500', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <i className="fas fa-plus" style={{ marginRight: '0.3rem' }}></i>Add Event
                                </button>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                {/* Month Navigation */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <button onClick={prevMonth} style={{ background: '#e5e7eb', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}><i className="fas fa-chevron-left"></i></button>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        {calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <button onClick={nextMonth} style={{ background: '#e5e7eb', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}><i className="fas fa-chevron-right"></i></button>
                                </div>

                                {/* Day Headers */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.5rem' }}>
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} style={{ fontWeight: '700', padding: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>{d}</div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
                                    {/* Empty cells for padding */}
                                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} style={{ padding: '0.5rem', color: '#d1d5db' }}></div>)}
                                    {/* Day cells */}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const td = isToday(day);
                                        const hasEv = eventDays.has(day);
                                        return (
                                            <div key={day} style={{ padding: '0.5rem', borderRadius: '4px', background: td ? '#3c6e71' : 'transparent', color: td ? '#fff' : '#2c3e50', fontWeight: td ? '700' : '400', position: 'relative', cursor: hasEv ? 'pointer' : 'default', transition: 'background 0.2s' }}
                                                onMouseEnter={e => { if (!td) e.currentTarget.style.background = '#f0e6d2'; }}
                                                onMouseLeave={e => { if (!td) e.currentTarget.style.background = 'transparent'; }}>
                                                {day}
                                                {hasEv && <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', background: td ? '#fff' : '#3c6e71', borderRadius: '50%' }}></div>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Upcoming Events List */}
                                {events.length > 0 && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Upcoming Events</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {events.slice(0, 5).map(ev => (
                                                <div key={ev._id} style={{ border: '1px solid #d4c9b0', borderRadius: '4px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{ev.title}</h4>
                                                        <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                            <i className="fas fa-calendar-alt" style={{ marginRight: '0.3rem' }}></i>
                                                            {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                        </p>
                                                        {ev.location && <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}><i className="fas fa-map-marker-alt" style={{ marginRight: '0.2rem' }}></i>{ev.location}</p>}
                                                    </div>
                                                    <button onClick={() => handleDeleteEvent(ev._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}><i className="fas fa-trash"></i></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {showEventModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
                    onClick={() => setShowEventModal(false)}>
                    <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', width: '500px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', fontFamily: "'Playfair Display', Georgia, serif" }}>Add New Event</h2>
                        <form onSubmit={handleCreateEvent}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Event Title *</label>
                                    <input type="text" required value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))}
                                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem', fontSize: '0.9rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Event Type</label>
                                    <select value={eventForm.eventType} onChange={e => setEventForm(p => ({ ...p, eventType: e.target.value }))}
                                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem', fontSize: '0.9rem' }}>
                                        <option value="meeting">Meeting</option><option value="workshop">Workshop</option><option value="social">Social</option><option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Description</label>
                                <textarea rows="3" value={eventForm.description} onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))}
                                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem', fontSize: '0.9rem', resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Start Date & Time *</label>
                                    <input type="datetime-local" required value={eventForm.startDate} onChange={e => setEventForm(p => ({ ...p, startDate: e.target.value }))}
                                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem', fontSize: '0.9rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>End Date & Time</label>
                                    <input type="datetime-local" value={eventForm.endDate} onChange={e => setEventForm(p => ({ ...p, endDate: e.target.value }))}
                                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem', fontSize: '0.9rem' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>Location</label>
                                <input type="text" value={eventForm.location} onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))}
                                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem', fontSize: '0.9rem' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setShowEventModal(false)} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#3c6e71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Add Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Community Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}
                    onClick={() => setShowEditModal(false)}>
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '0', width: '560px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ background: 'linear-gradient(135deg, #3c6e71, #284b63)', padding: '1.5rem 2rem', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', color: '#fff' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', fontFamily: "'Playfair Display', Georgia, serif" }}>
                                <i className="fas fa-edit" style={{ marginRight: '0.5rem' }}></i>Edit Community
                            </h2>
                        </div>
                        <form onSubmit={handleEditSave} style={{ padding: '2rem' }}>
                            {/* Logo Upload */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Community Logo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{
                                        width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                                        border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: '#f9fafb', cursor: 'pointer'
                                    }}
                                        onClick={() => document.getElementById('edit-logo-input').click()}
                                    >
                                        {editImagePreview ? (
                                            <img src={editImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <i className="fas fa-camera" style={{ fontSize: '1.4rem', color: '#9ca3af', display: 'block', marginBottom: '0.2rem' }}></i>
                                                <span style={{ fontSize: '0.6rem', color: '#9ca3af' }}>Upload</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <input id="edit-logo-input" type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                                            onChange={handleEditImageChange} style={{ display: 'none' }} />
                                        <button type="button" onClick={() => document.getElementById('edit-logo-input').click()}
                                            style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                            <i className="fas fa-upload" style={{ marginRight: '0.3rem' }}></i>
                                            {editImagePreview ? 'Change Logo' : 'Upload Logo'}
                                        </button>
                                        {editImagePreview && (
                                            <button type="button" onClick={() => { setEditImageFile(null); setEditImagePreview(null); }}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                                <i className="fas fa-trash" style={{ marginRight: '0.2rem' }}></i>Remove
                                            </button>
                                        )}
                                        <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.3rem' }}>JPG, PNG, GIF, WebP or SVG</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Community Name *</label>
                                <input type="text" required value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Description *</label>
                                <textarea required rows={4} value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Location *</label>
                                    <input type="text" required value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
                                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Category</label>
                                    <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                                        style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                                        <option value="">Select</option>
                                        <option value="education">Education</option>
                                        <option value="environment">Environment</option>
                                        <option value="health">Health</option>
                                        <option value="technology">Technology</option>
                                        <option value="social">Social</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '0.6rem 1.25rem', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Cancel</button>
                                <button type="submit" disabled={editSaving} style={{ padding: '0.6rem 1.25rem', background: editSaving ? '#9ca3af' : '#3c6e71', color: '#fff', border: 'none', borderRadius: '8px', cursor: editSaving ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                                    {editSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
