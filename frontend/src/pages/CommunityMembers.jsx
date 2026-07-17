import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';

export default function CommunityMembers() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [community, setCommunity] = useState(null);
    const [members, setMembers] = useState([]);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, mRes] = await Promise.allSettled([
                    api.get(`/communities/${id}`),
                    api.get(`/communities/${id}/members`),
                ]);
                if (cRes.status === 'fulfilled') {
                    const c = cRes.value.data;
                    setCommunity(c);
                    const isAdmin = c.adminId?._id === user?._id || c.adminId === user?._id;
                    if (!isAdmin) { navigate(`/communities/${id}`); return; }
                    setAdmin(c.adminId);
                }
                if (mRes.status === 'fulfilled') setMembers(mRes.value.data);
            } catch { }
            setLoading(false);
        };
        fetchData();
    }, [id, navigate, user]);

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await api.put(`/communities/${id}/members/${userId}/role`, { role: newRole });
            setMembers(prev => prev.map(m => {
                if ((m.userId?._id || m.userId) === userId) return { ...m, role: newRole };
                return m;
            }));
            setSuccess('Member role updated successfully.');
            setTimeout(() => setSuccess(''), 3000);
        } catch { }
    };

    const handleRemove = async (userId) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            await api.delete(`/communities/${id}/members/${userId}`);
            setMembers(prev => prev.filter(m => (m.userId?._id || m.userId) !== userId));
            setSuccess('Member removed successfully.');
            setTimeout(() => setSuccess(''), 3000);
        } catch { }
    };

    const imgUrl = (img) => getMediaUrl(img);

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#4f46e5' }}></i></div>;
    if (!community) return null;

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Manage Members</h1>
                    <Link to={`/communities/${id}/dashboard`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '500' }}>
                        <i className="fas fa-arrow-left" style={{ marginRight: '0.4rem' }}></i>Back to Dashboard
                    </Link>
                </div>

                {/* Success Alert */}
                {success && (
                    <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{success}</span>
                        <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}><i className="fas fa-times"></i></button>
                    </div>
                )}

                {/* Admin Card */}
                <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Community Admin</h2>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                            {imgUrl(admin?.profileImage) ? <img src={imgUrl(admin.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-user" style={{ color: '#4f46e5' }}></i></div>}
                        </div>
                        <div style={{ marginLeft: '1rem' }}>
                            <h3 style={{ fontWeight: '600', fontSize: '1rem' }}>{admin?.fullName || admin?.username}</h3>
                            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>@{admin?.username}</p>
                        </div>
                        <span style={{ marginLeft: 'auto', background: '#eef2ff', color: '#4f46e5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' }}>Administrator</span>
                    </div>
                </div>

                {/* Members List */}
                <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Community Members ({members.length})</h2>
                    {members.length === 0 ? (
                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No members yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {members.map(m => {
                                const memberId = m.userId?._id || m.userId;
                                const memberData = m.userId || {};
                                return (
                                    <div key={memberId} style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                            {imgUrl(memberData.profileImage) ? <img src={imgUrl(memberData.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-user" style={{ fontSize: '0.75rem', color: '#9ca3af' }}></i></div>}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontWeight: '600', fontSize: '0.95rem' }}>{memberData.fullName || memberData.username || 'Member'}</h3>
                                            <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>@{memberData.username} • Joined {new Date(m.joinedAt || m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                            <select value={m.role || 'member'} onChange={e => handleUpdateRole(memberId, e.target.value)}
                                                style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}>
                                                <option value="member">Member</option>
                                                <option value="moderator">Moderator</option>
                                            </select>
                                            <button onClick={() => handleRemove(memberId)}
                                                style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500' }}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
