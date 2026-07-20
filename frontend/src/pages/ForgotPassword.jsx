import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setMessage('');
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setMessage(data.message);
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
                            <i className="fas fa-key" style={{ fontSize: '24px' }}></i>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.35rem' }}>Forgot Password?</h1>
                        <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>Enter your email and we'll send you a reset link</p>
                    </div>

                    {/* Form */}
                    <div style={{ padding: '2rem' }}>
                        {message && (
                            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-check-circle"></i> {message}
                            </div>
                        )}
                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                                    <i className="fas fa-envelope" style={{ color: '#6366f1', marginRight: '0.4rem' }}></i>Email Address
                                </label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter the email you registered with" style={inputStyle} required
                                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                                    onBlur={e => e.target.style.borderColor = '#d1d5db'} />
                            </div>

                            <button type="submit" disabled={loading}
                                style={{
                                    width: '100%', padding: '0.85rem', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #4338ca, #6366f1)',
                                    color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700',
                                    cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                                }}>
                                {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Sending...</> : '📧 Send Reset Link'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                            Remember your password?{' '}
                            <Link to="/login" style={{ color: '#4338ca', fontWeight: '600', textDecoration: 'none' }}>Back to Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
