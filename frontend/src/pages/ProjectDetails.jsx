import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import api from '../api/api';
import PostCard from '../components/PostCard';
import { getMediaUrl } from '../utils/media';

export default function ProjectDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const fileRef = useRef(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [filesUploading, setFilesUploading] = useState(false);

    // Join request state
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinReason, setJoinReason] = useState('');
    const [joinSubmitting, setJoinSubmitting] = useState(false);
    const [myRequest, setMyRequest] = useState(null);
    const [joinRequests, setJoinRequests] = useState([]);

    useEffect(() => {
        api.get(`/projects/${id}`).then(r => setProject(r.data)).catch(() => navigate('/projects')).finally(() => setLoading(false));
        api.get(`/posts/project/${id}`).then(r => setPosts(r.data || [])).catch(() => { });
    }, [id, navigate]);

    // Fetch user's own join request status
    useEffect(() => {
        if (user) {
            api.get(`/projects/${id}/my-request`).then(r => setMyRequest(r.data.request)).catch(() => { });
        }
    }, [id, user]);

    // Fetch pending join requests if creator
    useEffect(() => {
        if (user && project && project.createdBy && (project.createdBy === user._id || project.createdBy._id === user._id)) {
            api.get(`/projects/${id}/join-requests`).then(r => setJoinRequests(r.data)).catch(() => { });
        }
    }, [id, user, project]);

    const handleJoinRequest = async () => {
        if (!joinReason.trim()) return;
        setJoinSubmitting(true);
        try {
            await api.post(`/projects/${id}/join`, { reason: joinReason.trim() });
            setMyRequest({ status: 'pending', reason: joinReason.trim() });
            setShowJoinModal(false);
            setJoinReason('');
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
        setJoinSubmitting(false);
    };

    const handleApproveRequest = async (requestId) => {
        try {
            await api.put(`/projects/${id}/join-requests/${requestId}/approve`);
            setJoinRequests(prev => prev.filter(r => r._id !== requestId));
            // Refresh project to update members
            const { data } = await api.get(`/projects/${id}`);
            setProject(data);
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await api.put(`/projects/${id}/join-requests/${requestId}/reject`);
            setJoinRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this project?')) {
            try { await api.delete(`/projects/${id}`); navigate('/projects'); } catch (err) { alert(err.response?.data?.message || 'Error'); }
        }
    };

    const handleImageUpdate = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await api.put(`/projects/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProject(prev => ({ ...prev, image: data.image }));
        } catch (err) { alert(err.response?.data?.message || 'Error uploading image'); }
        setUploading(false);
    };

    const handleDeletePost = (postId) => { setPosts(prev => prev.filter(p => p._id !== postId)); };

    const handleFilesUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setFilesUploading(true);
        try {
            const formData = new FormData();
            files.forEach(f => formData.append('files', f));
            const { data } = await api.post(`/projects/${id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProject(prev => ({ ...prev, files: data.files }));
        } catch (err) { alert(err.response?.data?.message || 'Error uploading files'); }
        setFilesUploading(false);
    };

    const handleDeleteFile = async (idx) => {
        if (!window.confirm('Delete this file?')) return;
        try {
            const { data } = await api.delete(`/projects/${id}/files/${idx}`);
            setProject(prev => ({ ...prev, files: data.files }));
        } catch (err) { alert(err.response?.data?.message || 'Error deleting file'); }
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: theme.accent }}></i></div>;
    if (!project) return null;

    const isCreator = user && project.createdBy && (project.createdBy === user._id || project.createdBy._id === user._id);
    const isMember = user && project.members?.some(m => (m.userId?._id || m.userId)?.toString() === user._id?.toString());
    const statusColors = { active: { bg: '#d1fae5', text: '#065f46' }, planning: { bg: '#fef3c7', text: '#92400e' }, completed: { bg: '#e0e7ff', text: '#3730a3' }, in_progress: { bg: '#dbeafe', text: '#1e40af' }, on_hold: { bg: '#fef3c7', text: '#92400e' } };
    const sc = statusColors[project.status] || statusColors.active;
    const card = { background: theme.bgCard, borderRadius: '16px', padding: '1.5rem', boxShadow: theme.shadow, border: `1px solid ${theme.border}` };
    const projectImageUrl = project.image ? getMediaUrl(project.image) : null;

    // Determine join button state
    const renderJoinButton = () => {
        if (!user || isCreator || isMember) return null;

        if (myRequest?.status === 'pending') {
            return (
                <div style={{ padding: '0.7rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '8px', fontWeight: '600', textAlign: 'center', fontSize: '0.9rem' }}>
                    <i className="fas fa-clock" style={{ marginRight: '0.4rem' }}></i>Request Pending
                </div>
            );
        }
        if (myRequest?.status === 'rejected') {
            return (
                <div style={{ padding: '0.7rem', background: theme.errorBg, color: theme.error, border: `1px solid ${theme.errorBorder}`, borderRadius: '8px', fontWeight: '600', textAlign: 'center', fontSize: '0.9rem' }}>
                    <i className="fas fa-times-circle" style={{ marginRight: '0.4rem' }}></i>Request Rejected
                </div>
            );
        }

        return (
            <button onClick={() => setShowJoinModal(true)} style={{ padding: '0.7rem', background: theme.accent, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%' }}>
                <i className="fas fa-paper-plane" style={{ marginRight: '0.4rem' }}></i>Request to Join
            </button>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg }}>
            {/* Hero */}
            <div style={{
                background: projectImageUrl
                    ? `linear-gradient(to bottom, rgba(49,46,129,0.75), rgba(67,56,202,0.85)), url(${projectImageUrl}) center/cover no-repeat`
                    : theme.heroBg,
                color: '#fff', padding: '3.5rem 1rem', textAlign: 'center', position: 'relative'
            }}>
                {projectImageUrl && (
                    <div style={{ marginBottom: '1rem' }}>
                        <img src={projectImageUrl} alt={project.name}
                            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                        />
                    </div>
                )}
                <span style={{ background: sc.bg, color: sc.text, padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem', display: 'inline-block' }}>{project.status || 'active'}</span>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{project.name}</h1>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', opacity: 0.85, flexWrap: 'wrap' }}>
                    <span><i className="fas fa-user-friends" style={{ marginRight: '0.4rem' }}></i>{project.members?.length || 0} members</span>
                    <span><i className="fas fa-calendar" style={{ marginRight: '0.4rem' }}></i>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                {isCreator && (
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => fileRef.current?.click()} disabled={uploading}
                            style={{ padding: '0.5rem 1.2rem', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: '600', fontSize: '0.85rem', cursor: uploading ? 'wait' : 'pointer', backdropFilter: 'blur(4px)' }}>
                            {uploading ? '⏳ Uploading...' : (projectImageUrl ? '📷 Update Image' : '📷 Add Project Image')}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpdate} style={{ display: 'none' }} />
                    </div>
                )}
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={card}>
                            <h2 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.75rem' }}><i className="fas fa-info-circle" style={{ color: theme.accent, marginRight: '0.5rem' }}></i>Description</h2>
                            <p style={{ color: theme.textSecondary, lineHeight: '1.7' }}>{project.description}</p>
                        </div>

                        {/* Pending Join Requests (creator only) */}
                        {isCreator && joinRequests.length > 0 && (
                            <div style={{ ...card, border: `2px solid #f59e0b` }}>
                                <h2 style={{ fontWeight: '700', color: theme.text, marginBottom: '1rem' }}>
                                    <i className="fas fa-user-clock" style={{ color: '#f59e0b', marginRight: '0.5rem' }}></i>
                                    Pending Join Requests
                                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', marginLeft: '0.5rem' }}>{joinRequests.length}</span>
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {joinRequests.map(req => (
                                        <div key={req._id} style={{ background: theme.bgCardHover, borderRadius: '12px', padding: '1rem', border: `1px solid ${theme.border}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                {req.userId?.profileImage ? (
                                                    <img src={getMediaUrl(req.userId.profileImage)} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${theme.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className="fas fa-user" style={{ color: theme.accent, fontSize: '0.8rem' }}></i>
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: '600', color: theme.text }}>{req.userId?.fullName || req.userId?.username}</div>
                                                    <div style={{ fontSize: '0.75rem', color: theme.textFaint }}>{req.userId?.email}</div>
                                                </div>
                                            </div>
                                            <div style={{ background: theme.bg, borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.75rem', fontSize: '0.88rem', color: theme.textSecondary, lineHeight: '1.5', borderLeft: `3px solid ${theme.accent}` }}>
                                                <strong style={{ color: theme.textMuted, fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Reason for joining:</strong>
                                                {req.reason}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleApproveRequest(req._id)}
                                                    style={{ flex: 1, padding: '0.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                                    <i className="fas fa-check" style={{ marginRight: '0.3rem' }}></i>Approve
                                                </button>
                                                <button onClick={() => handleRejectRequest(req._id)}
                                                    style={{ flex: 1, padding: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                                    <i className="fas fa-times" style={{ marginRight: '0.3rem' }}></i>Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Project Files */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontWeight: '700', color: theme.text }}>
                                    <i className="fas fa-folder-open" style={{ color: theme.accent, marginRight: '0.5rem' }}></i>Project Files
                                </h2>
                                {(isCreator || isMember) && (
                                    <label style={{ background: theme.accent, color: '#fff', padding: '0.4rem 0.9rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.82rem', cursor: filesUploading ? 'wait' : 'pointer', opacity: filesUploading ? 0.7 : 1 }}>
                                        {filesUploading ? '⏳ Uploading...' : '+ Upload Files'}
                                        <input type="file" multiple onChange={handleFilesUpload} style={{ display: 'none' }} disabled={filesUploading} />
                                    </label>
                                )}
                            </div>
                            {(!project.files || project.files.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: theme.textFaint }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
                                    <p>No files uploaded yet. Upload code, docs, or any project files!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {project.files.map((f, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', background: theme.bgCardHover, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                                            <i className="fas fa-file" style={{ color: theme.accent, fontSize: '1.1rem', flexShrink: 0 }}></i>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.88rem', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.fileName}</div>
                                                <div style={{ fontSize: '0.72rem', color: theme.textFaint }}>{f.fileSize ? `${(f.fileSize / 1024).toFixed(1)} KB` : ''}</div>
                                            </div>
                                            <a href={getMediaUrl(f.filePath)} download={f.fileName} style={{ color: theme.accentText, fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>⬇ Download</a>
                                            {isCreator && (
                                                <button onClick={() => handleDeleteFile(idx)} style={{ background: 'none', border: 'none', color: theme.error, cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0 }}>🗑</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {project.startDate && (
                            <div style={card}>
                                <h2 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.75rem' }}><i className="fas fa-calendar-alt" style={{ color: theme.accent, marginRight: '0.5rem' }}></i>Timeline</h2>
                                <div style={{ display: 'flex', gap: '2rem', color: theme.textSecondary }}>
                                    <div><strong>Start:</strong> {new Date(project.startDate).toLocaleDateString()}</div>
                                    {project.endDate && <div><strong>End:</strong> {new Date(project.endDate).toLocaleDateString()}</div>}
                                </div>
                            </div>
                        )}

                        {/* Posts */}
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontWeight: '700', color: theme.text }}>
                                    <i className="fas fa-bullhorn" style={{ color: theme.accent, marginRight: '0.5rem' }}></i>Project Updates
                                </h2>
                                {(isCreator || isMember) && (
                                    <Link to={`/feed?project=${id}`} style={{ background: theme.accent, color: '#fff', padding: '0.4rem 0.9rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.82rem' }}>
                                        + Post Update
                                    </Link>
                                )}
                            </div>
                            {posts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: theme.textFaint }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                                    <p>No updates yet. Share progress about this project!</p>
                                </div>
                            ) : (
                                posts.map(post => <PostCard key={post._id} post={post} onDelete={handleDeletePost} />)
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {user && (
                            <div style={card}>
                                <h3 style={{ fontWeight: '700', color: theme.text, marginBottom: '1rem' }}>Actions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {isMember && (
                                        <div style={{ padding: '0.7rem', background: theme.successBg || '#ecfdf5', color: theme.success || '#059669', borderRadius: '8px', fontWeight: '600', textAlign: 'center', fontSize: '0.9rem', border: `1px solid ${theme.success || '#059669'}30` }}>
                                            <i className="fas fa-check-circle" style={{ marginRight: '0.4rem' }}></i>Member
                                        </div>
                                    )}
                                    {renderJoinButton()}
                                    {(isCreator || isMember) && (
                                        <Link to={`/feed?project=${id}`} style={{ display: 'block', padding: '0.7rem', background: theme.accentLight, color: theme.accentText, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>
                                            <i className="fas fa-pen" style={{ marginRight: '0.4rem' }}></i>Post Update
                                        </Link>
                                    )}
                                    {isCreator && (
                                        <button onClick={handleDelete} style={{ padding: '0.7rem', background: theme.errorBg, color: theme.error, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                            <i className="fas fa-trash" style={{ marginRight: '0.4rem' }}></i>Delete Project
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        <div style={card}>
                            <h3 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.75rem' }}>Details</h3>
                            <div style={{ color: theme.textMuted, fontSize: '0.9rem', lineHeight: '2' }}>
                                <div><i className="fas fa-signal" style={{ width: '20px', color: theme.textFaint }}></i> Status: {project.status || 'active'}</div>
                                <div><i className="fas fa-user-friends" style={{ width: '20px', color: theme.textFaint }}></i> {project.members?.length || 0} members</div>
                                <div><i className="fas fa-clock" style={{ width: '20px', color: theme.textFaint }}></i> Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Join Request Modal */}
            {showJoinModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setShowJoinModal(false)}>
                    <div style={{ background: theme.bgCard, borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '90%', boxShadow: theme.shadowLg, border: `1px solid ${theme.border}` }}
                        onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                            <i className="fas fa-paper-plane" style={{ color: theme.accent, marginRight: '0.5rem' }}></i>Request to Join
                        </h2>
                        <p style={{ color: theme.textMuted, marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                            Tell the project owner why you'd like to join <strong>"{project.name}"</strong>
                        </p>
                        <textarea
                            value={joinReason}
                            onChange={e => setJoinReason(e.target.value)}
                            placeholder="I'd like to join because..."
                            rows={4}
                            style={{
                                width: '100%', padding: '0.85rem', borderRadius: '10px', border: `1px solid ${theme.border}`,
                                background: theme.bgInput, color: theme.text, fontSize: '0.9rem', resize: 'vertical',
                                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                            <button onClick={() => setShowJoinModal(false)}
                                style={{ flex: 1, padding: '0.7rem', background: theme.bgMuted, color: theme.text, border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                                Cancel
                            </button>
                            <button onClick={handleJoinRequest} disabled={!joinReason.trim() || joinSubmitting}
                                style={{ flex: 1, padding: '0.7rem', background: theme.accent, color: '#fff', border: 'none', borderRadius: '10px', cursor: joinSubmitting ? 'wait' : 'pointer', fontWeight: '600', opacity: (!joinReason.trim() || joinSubmitting) ? 0.6 : 1 }}>
                                {joinSubmitting ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
