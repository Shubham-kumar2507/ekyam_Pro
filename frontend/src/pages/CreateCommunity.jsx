import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/useTheme';
import api from '../api/api';

export default function CreateCommunity() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [form, setForm] = useState({ name: '', description: '', location: '', category: '', latitude: '', longitude: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('location', form.location);
            if (form.category) formData.append('category', form.category);
            formData.append('coordinates', JSON.stringify({
                latitude: form.latitude ? Number(form.latitude) : null,
                longitude: form.longitude ? Number(form.longitude) : null,
                address: form.location
            }));
            if (imageFile) formData.append('image', imageFile);

            const { data } = await api.post('/communities', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate(`/communities/${data._id}`);
        } catch (err) { setError(err.response?.data?.message || 'Error creating community'); }
        setLoading(false);
    };

    const inputStyle = { width: '100%', padding: '0.7rem 1rem', border: `1px solid ${theme.border}`, borderRadius: '10px', fontSize: '0.95rem', background: theme.bgInput, color: theme.text, outline: 'none', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme.textSecondary, marginBottom: '0.35rem' };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, padding: '3rem 1rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ background: theme.bgCard, borderRadius: '20px', boxShadow: theme.shadow, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                    <div style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', padding: '2rem', textAlign: 'center', color: '#fff' }}>
                        <i className="fas fa-users" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}></i>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Create Community</h1>
                        <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>Build a new community space</p>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}><i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>{error}</div>}
                        <form onSubmit={handleSubmit}>
                            {/* Community Logo Upload */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Community Logo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{
                                        width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                                        border: `2px dashed ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: theme.bgInput, position: 'relative', cursor: 'pointer'
                                    }}
                                        onClick={() => document.getElementById('community-logo-input').click()}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <i className="fas fa-camera" style={{ fontSize: '1.5rem', color: theme.textFaint, display: 'block', marginBottom: '0.25rem' }}></i>
                                                <span style={{ fontSize: '0.65rem', color: theme.textFaint }}>Upload</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            id="community-logo-input"
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                        <button type="button" onClick={() => document.getElementById('community-logo-input').click()}
                                            style={{ background: theme.accentLight, color: theme.accentText, border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                                            <i className="fas fa-upload" style={{ marginRight: '0.4rem' }}></i>
                                            {imagePreview ? 'Change Logo' : 'Choose Image'}
                                        </button>
                                        {imagePreview && (
                                            <button type="button" onClick={removeImage}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: '500' }}>
                                                <i className="fas fa-trash" style={{ marginRight: '0.25rem' }}></i>Remove
                                            </button>
                                        )}
                                        <p style={{ fontSize: '0.75rem', color: theme.textFaint, marginTop: '0.35rem' }}>JPG, PNG, GIF, WebP or SVG. Max 50MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Community Name *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} required /></div>
                            <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Description *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} required /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div><label style={labelStyle}>Location *</label><input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} required /></div>
                                <div><label style={labelStyle}>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}><option value="">Select</option><option value="education">Education</option><option value="environment">Environment</option><option value="health">Health</option><option value="technology">Technology</option><option value="social">Social</option><option value="other">Other</option></select></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div><label style={labelStyle}>Latitude</label><input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} style={inputStyle} placeholder="e.g. 28.6139" /></div>
                                <div><label style={labelStyle}>Longitude</label><input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} style={inputStyle} placeholder="e.g. 77.2090" /></div>
                            </div>
                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: loading ? '#9ca3af' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                                {loading ? 'Creating...' : 'Create Community'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
