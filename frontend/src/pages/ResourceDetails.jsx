import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';

export default function ResourceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme } = useTheme();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filesUploading, setFilesUploading] = useState(false);

    useEffect(() => {
        api.get(`/resources/${id}`).then(r => setResource(r.data)).catch(() => navigate('/resources')).finally(() => setLoading(false));
    }, [id, navigate]);

    const handleDownload = async () => {
        try {
            await api.post(`/resources/${id}/download`);
            setResource(prev => ({ ...prev, downloadCount: (prev.downloadCount || 0) + 1 }));
            const fileUrl = resource.filePath ? getMediaUrl(resource.filePath) : resource.url;
            if (fileUrl) window.open(fileUrl, '_blank');
            else alert('No file or URL attached to this resource.');
        } catch (err) { /* */ }
    };

    const isOwner = user && resource && (resource.uploadedBy === user._id || resource.uploadedBy?._id === user._id);

    const handleFilesUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setFilesUploading(true);
        try {
            const formData = new FormData();
            files.forEach(f => formData.append('files', f));
            const { data } = await api.post(`/resources/${id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setResource(prev => ({ ...prev, files: data.files }));
        } catch (err) { alert(err.response?.data?.message || 'Error uploading files'); }
        setFilesUploading(false);
    };

    const handleDeleteFile = async (idx) => {
        if (!window.confirm('Delete this file?')) return;
        try {
            const { data } = await api.delete(`/resources/${id}/files/${idx}`);
            setResource(prev => ({ ...prev, files: data.files }));
        } catch (err) { alert(err.response?.data?.message || 'Error deleting file'); }
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0891b2' }}></i></div>;
    if (!resource) return null;

    const typeIcons = { document: 'fas fa-file-alt', link: 'fas fa-link', video: 'fas fa-video', image: 'fas fa-image', other: 'fas fa-file' };
    const typeColors = { document: '#4f46e5', link: '#0891b2', video: '#dc2626', image: '#059669', other: '#6b7280' };
    const icon = typeIcons[resource.type] || typeIcons.other;
    const color = typeColors[resource.type] || typeColors.other;
    const card = { background: theme.bgCard, borderRadius: '16px', padding: '1.5rem', boxShadow: theme.shadow, border: `1px solid ${theme.border}` };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg }}>
            <div style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)', color: '#fff', padding: '3.5rem 1rem', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <i className={icon} style={{ fontSize: '2rem' }}></i>
                </div>
                <span style={{ background: `${color}30`, padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.75rem', display: 'inline-block' }}>{resource.type || 'other'}</span>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{resource.title}</h1>
                <div style={{ opacity: 0.85 }}>
                    <span><i className="fas fa-download" style={{ marginRight: '0.4rem' }}></i>{resource.downloadCount || 0} downloads</span>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={card}>
                    <h2 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.75rem' }}><i className="fas fa-info-circle" style={{ color: '#0891b2', marginRight: '0.5rem' }}></i>Description</h2>
                    <p style={{ color: theme.textSecondary, lineHeight: '1.7' }}>{resource.description}</p>
                </div>

                {(resource.files && resource.files.length > 0) && (
                    <div style={{ ...card, marginTop: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.75rem' }}><i className="fas fa-paperclip" style={{ color: '#0891b2', marginRight: '0.5rem' }}></i>Attached Files</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {resource.files.map((f, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: theme.bgCardHover, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                                    <i className="fas fa-file" style={{ color: '#0891b2', fontSize: '1rem', flexShrink: 0 }}></i>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.fileName}</div>
                                        <div style={{ fontSize: '0.72rem', color: theme.textFaint }}>{f.fileSize ? `${(f.fileSize / 1024).toFixed(1)} KB` : ''}</div>
                                    </div>
                                    <a href={getMediaUrl(f.filePath)} download={f.fileName} style={{ color: '#0891b2', fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>⬇ Download</a>
                                    {isOwner && (
                                        <button onClick={() => handleDeleteFile(idx)} style={{ background: 'none', border: 'none', color: theme.error, cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0 }}>🗑</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isOwner && (
                    <div style={{ ...card, marginTop: '1.5rem' }}>
                        <label style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.75rem', border: `2px dashed ${theme.border}`, borderRadius: '10px',
                            cursor: filesUploading ? 'wait' : 'pointer', color: theme.textMuted, fontSize: '0.88rem',
                            background: theme.bgCardHover, transition: 'border-color 0.2s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = '#0891b2'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
                        >
                            <i className="fas fa-plus-circle" style={{ color: '#0891b2' }}></i>
                            {filesUploading ? 'Uploading...' : 'Upload additional files (all types supported)'}
                            <input type="file" multiple onChange={handleFilesUpload} style={{ display: 'none' }} disabled={filesUploading} />
                        </label>
                    </div>
                )}

                {resource.tags && resource.tags.length > 0 && (
                    <div style={{ ...card, marginTop: '1.5rem' }}>
                        <h3 style={{ fontWeight: '700', color: theme.text, marginBottom: '0.75rem' }}>Tags</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {resource.tags.map(tag => (
                                <span key={tag} style={{ background: theme.accentLight, color: theme.accentText, padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>{tag}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button onClick={handleDownload}
                        style={{ flex: 1, padding: '0.85rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}>
                        <i className="fas fa-download" style={{ marginRight: '0.5rem' }}></i>Download / Open
                    </button>
                    <button onClick={() => navigate('/resources')}
                        style={{ padding: '0.85rem 1.5rem', background: theme.bgMuted, color: theme.textSecondary, border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                        <i className="fas fa-arrow-left" style={{ marginRight: '0.4rem' }}></i>Back
                    </button>
                </div>
            </div>
        </div>
    );
}
