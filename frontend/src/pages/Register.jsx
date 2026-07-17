import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';

export default function Register() {
    const { register } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', fullName: '', userType: 'individual', location: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return setError('Passwords do not match');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true); setError('');
        try {
            await register({ username: form.username, email: form.email, password: form.password, fullName: form.fullName, userType: form.userType, location: form.location });
            navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally { setLoading(false); }
    };

    const inputStyle = {
        width: '100%', padding: '0.7rem 1rem', border: `1px solid ${theme.border}`, borderRadius: '10px',
        fontSize: '0.95rem', background: theme.bgInput, color: theme.text, outline: 'none'
    };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme.textSecondary, marginBottom: '0.35rem' };

    return (
        <div style={{ minHeight: '100vh', background: theme.heroBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '100%', maxWidth: '520px' }}>
                <div style={{ background: theme.bgCard, borderRadius: '20px', boxShadow: theme.shadowLg, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)', padding: '2rem', textAlign: 'center', color: '#fff' }}>
                        <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <i className="fas fa-user-plus" style={{ fontSize: '24px' }}></i>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.35rem' }}>Join EKYAM</h1>
                        <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>Create your account and connect with communities</p>
                    </div>

                    {/* Form */}
                    <div style={{ padding: '2rem' }}>
                        {error && (
                            <div style={{ background: theme.errorBg, border: `1px solid ${theme.errorBorder}`, color: theme.error, padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={labelStyle}><i className="fas fa-user" style={{ color: '#6366f1', marginRight: '0.35rem' }}></i>Full Name *</label>
                                    <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        placeholder="Name and Surname" style={inputStyle} required
                                        onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = theme.border} />
                                </div>
                                <div>
                                    <label style={labelStyle}><i className="fas fa-at" style={{ color: '#6366f1', marginRight: '0.35rem' }}></i>Username *</label>
                                    <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                        placeholder="username" style={inputStyle} required
                                        onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = theme.border} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}><i className="fas fa-envelope" style={{ color: '#6366f1', marginRight: '0.35rem' }}></i>Email *</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="email@example.com" style={inputStyle} required
                                    onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = theme.border} />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}><i className="fas fa-map-marker-alt" style={{ color: '#6366f1', marginRight: '0.35rem' }}></i>Location</label>
                                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                                    placeholder="City, Country" style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = theme.border} />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}><i className="fas fa-id-badge" style={{ color: '#6366f1', marginRight: '0.35rem' }}></i>Account Type</label>
                                <select value={form.userType} onChange={e => setForm({ ...form, userType: e.target.value })}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                    onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = theme.border}>
                                    <option value="individual">Individual Member</option>
                                    <option value="community_admin">Community Administrator</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}><i className="fas fa-lock" style={{ color: '#6366f1', marginRight: '0.35rem' }}></i>Password *</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                            placeholder="Min 6 chars" style={{ ...inputStyle, paddingRight: '2.5rem' }} required
                                            onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = theme.border} />
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.textFaint, fontSize: '0.85rem', padding: '0.2rem' }}>
                                            <i className={showPass ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><i className="fas fa-lock" style={{ color: '#6366f1', marginRight: '0.35rem' }}></i>Confirm *</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                            placeholder="Re-enter" style={{ ...inputStyle, paddingRight: '2.5rem' }} required
                                            onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = theme.border} />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.textFaint, fontSize: '0.85rem', padding: '0.2rem' }}>
                                            <i className={showConfirm ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                style={{
                                    width: '100%', padding: '0.85rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #4338ca, #6366f1)',
                                    color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700',
                                    cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 15px rgba(67,56,202,0.3)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>
                                {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Creating Account...</> : 'Create Account'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: theme.textMuted, fontSize: '0.9rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: theme.accentText, fontWeight: '600', textDecoration: 'none' }}>Login here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
