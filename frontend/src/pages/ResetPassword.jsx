import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/reset-password', { token, newPassword });
            setMessage(data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (_err) {
            setError(_err.response?.data?.message || 'Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '10px',
        fontSize: '0.95rem', background: '#f9fafb', outline: 'none', transition: 'border-color 0.2s'
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 20px 60px rgba(67, 56, 202, 0.12)', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)', padding: '2.5rem 2rem', textAlign: 'center', color: '#fff' }}>
                        <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <i className="fas fa-shield-alt" style={{ fontSize: '24px' }}></i>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.35rem' }}>Set New Password</h1>
                        <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>Enter your new password below</p>
                    </div>

                    {/* Form */}
                    <div style={{ padding: '2rem' }}>
                        {message && (
                            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-check-circle"></i> {message}
                                <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.7 }}>Redirecting to login...</span>
                            </div>
                        )}
                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        {!message && (
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                                        <i className="fas fa-lock" style={{ color: '#6366f1', marginRight: '0.4rem' }}></i>New Password
                                    </label>
                                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (min 6 chars)" style={inputStyle} required minLength={6}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                                </div>

                                <div style={{ marginBottom: '1.75rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                                        <i className="fas fa-lock" style={{ color: '#6366f1', marginRight: '0.4rem' }}></i>Confirm Password
                                    </label>
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your new password" style={inputStyle} required minLength={6}
                                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                                        onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                                </div>

                                <button type="submit" disabled={loading}
                                    style={{
                                        width: '100%', padding: '0.85rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #4338ca, #6366f1)',
                                        color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700',
                                        cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                                    }}>
                                    {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Resetting...</> : '🔒 Reset Password'}
                                </button>
                            </form>
                        )}

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                            <Link to="/login" style={{ color: '#4338ca', fontWeight: '600', textDecoration: 'none' }}>← Back to Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
