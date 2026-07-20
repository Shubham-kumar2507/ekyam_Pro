import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function CreateProject() {
    const navigate = useNavigate();
    const fileRef = useRef(null);
    const [communities, setCommunities] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', status: 'planning', communityId: '', startDate: '', endDate: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [projectFiles, setProjectFiles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { api.get('/communities').then(r => setCommunities(r.data)).catch(() => { }); }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('status', form.status);
            if (form.communityId) formData.append('communityId', form.communityId);
            if (form.startDate) formData.append('startDate', form.startDate);
            if (form.endDate) formData.append('endDate', form.endDate);
            if (imageFile) formData.append('image', imageFile);

            const { data } = await api.post('/projects', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Upload project files if any
            if (projectFiles.length > 0) {
                const filesFormData = new FormData();
                projectFiles.forEach(f => filesFormData.append('files', f));
                await api.post(`/projects/${data._id}/files`, filesFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            navigate(`/projects/${data._id}`);
        } catch (_err) { setError(_err.response?.data?.message || 'Error creating project'); }
        setLoading(false);
    };

    const inputStyle = { width: '100%', padding: '0.7rem 1rem', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '0.95rem', background: '#f9fafb', outline: 'none' };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '3rem 1rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(135deg, #312e81, #6366f1)', padding: '2rem', textAlign: 'center', color: '#fff' }}>
                        <i className="fas fa-project-diagram" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}></i>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Create Project</h1>
                        <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>Start a new collaborative project</p>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}><i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Project Name *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} required /></div>
                            <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Description *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} required /></div>

                            {/* Image Upload */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Project Image</label>
                                <div style={{ border: '2px dashed #d1d5db', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'border-color 0.2s' }}
                                    onClick={() => fileRef.current?.click()}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" style={{ maxHeight: '150px', borderRadius: '10px', marginBottom: '0.5rem' }} />
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}></i>
                                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Click to upload an image</p>
                                            <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>JPG, PNG, GIF up to 50MB</p>
                                        </>
                                    )}
                                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                </div>
                            </div>

                            {/* Project Files Upload */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Project Files</label>
                                <div style={{ border: '2px dashed #d1d5db', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'border-color 0.2s' }}
                                    onClick={() => document.getElementById('project-files-input')?.click()}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d5db'}>
                                    {projectFiles.length > 0 ? (
                                        <div>
                                            <i className="fas fa-folder-open" style={{ fontSize: '2rem', color: '#6366f1', marginBottom: '0.5rem', display: 'block' }}></i>
                                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>{projectFiles.length} file(s) selected</p>
                                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                                                {projectFiles.map((f, i) => (
                                                    <span key={i} style={{ fontSize: '0.75rem', color: '#6b7280', background: '#e5e7eb', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                                                        {f.name} ({(f.size / 1024).toFixed(1)} KB)
                                                    </span>
                                                ))}
                                            </div>
                                            <button type="button" onClick={e => { e.stopPropagation(); setProjectFiles([]); }} style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
                                        </div>
                                    ) : (
                                        <>
                                            <i className="fas fa-folder-plus" style={{ fontSize: '2rem', color: '#9ca3af', marginBottom: '0.5rem', display: 'block' }}></i>
                                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Click to upload project files</p>
                                            <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>All file types supported — .cpp, .py, .md, .zip, etc. (up to 50MB each)</p>
                                        </>
                                    )}
                                    <input id="project-files-input" type="file" multiple onChange={e => setProjectFiles(Array.from(e.target.files))} style={{ display: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div><label style={labelStyle}>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}><option value="planning">Planning</option><option value="active">Active</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select></div>
                                <div><label style={labelStyle}>Community</label><select value={form.communityId} onChange={e => setForm({ ...form, communityId: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}><option value="">Select (optional)</option>{communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div><label style={labelStyle}>Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={inputStyle} /></div>
                                <div><label style={labelStyle}>End Date</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={inputStyle} /></div>
                            </div>
                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: loading ? '#9ca3af' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Creating...</> : 'Create Project'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
