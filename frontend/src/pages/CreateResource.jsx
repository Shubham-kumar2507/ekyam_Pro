import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function CreateResource() {
    const navigate = useNavigate();
    const fileRef = useRef(null);
    const [communities, setCommunities] = useState([]);
    const [form, setForm] = useState({ title: '', description: '', type: 'document', url: '', communityId: '', isPublic: true, tags: '' });
    const [uploadFile, setUploadFile] = useState(null);
    const [additionalFiles, setAdditionalFiles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { api.get('/communities').then(r => setCommunities(r.data)).catch(() => { }); }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setUploadFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('type', form.type);
            if (form.url) formData.append('url', form.url);
            if (form.communityId) formData.append('communityId', form.communityId);
            formData.append('isPublic', form.isPublic);
            if (form.tags) formData.append('tags', form.tags);
            if (uploadFile) formData.append('file', uploadFile);
            additionalFiles.forEach(f => formData.append('files', f));

            const { data } = await api.post('/resources', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate(`/resources/${data._id}`);
        } catch (_err) { setError(_err.response?.data?.message || 'Error creating resource'); }
        setLoading(false);
    };

    const inputStyle = { width: '100%', padding: '0.7rem 1rem', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '0.95rem', background: '#f9fafb', outline: 'none' };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' };

    const fileTypeIcon = { document: 'fas fa-file-alt', link: 'fas fa-link', video: 'fas fa-video', image: 'fas fa-image', code: 'fas fa-code', other: 'fas fa-file' };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '3rem 1rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0c4a6e, #0891b2)', padding: '2rem', textAlign: 'center', color: '#fff' }}>
                        <i className="fas fa-upload" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}></i>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Share Resource</h1>
                        <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>Upload files, code, or share links</p>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}><i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Title *</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} required /></div>
                            <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Description *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} required /></div>

                            {/* File Upload */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Upload File</label>
                                <div style={{ border: '2px dashed #d1d5db', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }}
                                    onClick={() => fileRef.current?.click()}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#0891b2'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}>
                                    {uploadFile ? (
                                        <div>
                                            <i className={fileTypeIcon[form.type] || 'fas fa-file'} style={{ fontSize: '2rem', color: '#0891b2', marginBottom: '0.5rem', display: 'block' }}></i>
                                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>{uploadFile.name}</p>
                                            <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}></i>
                                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Click to upload a file</p>
                                            <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Documents, images, code, videos up to 50MB</p>
                                        </>
                                    )}
                                    <input ref={fileRef} type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                                </div>
                            </div>

                            {/* Additional Files */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Additional Files</label>
                                <div style={{ border: '2px dashed #d1d5db', borderRadius: '12px', padding: '1rem', textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }}
                                    onClick={() => document.getElementById('additional-files-input')?.click()}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#0891b2'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}>
                                    {additionalFiles.length > 0 ? (
                                        <div>
                                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.85rem' }}>{additionalFiles.length} additional file(s)</p>
                                            <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'center' }}>
                                                {additionalFiles.map((f, i) => (
                                                    <span key={i} style={{ fontSize: '0.72rem', color: '#6b7280', background: '#e5e7eb', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>{f.name}</span>
                                                ))}
                                            </div>
                                            <button type="button" onClick={e => { e.stopPropagation(); setAdditionalFiles([]); }} style={{ marginTop: '0.3rem', fontSize: '0.72rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Click to attach more files (all types supported, up to 50MB each)</p>
                                    )}
                                    <input id="additional-files-input" type="file" multiple onChange={e => setAdditionalFiles(Array.from(e.target.files))} style={{ display: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div><label style={labelStyle}>Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}><option value="document">Document</option><option value="link">Link</option><option value="video">Video</option><option value="image">Image</option><option value="code">Code</option><option value="other">Other</option></select></div>
                                <div><label style={labelStyle}>Community</label><select value={form.communityId} onChange={e => setForm({ ...form, communityId: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}><option value="">Select (optional)</option>{communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>URL (for links)</label><input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." style={inputStyle} /></div>
                            <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Tags (comma-separated)</label><input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="react, javascript, tutorial" style={inputStyle} /></div>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} id="isPublic" />
                                <label htmlFor="isPublic" style={{ fontSize: '0.9rem', color: '#374151' }}>Make this resource public</label>
                            </div>
                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: loading ? '#9ca3af' : '#0891b2', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Uploading...</> : 'Share Resource'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
