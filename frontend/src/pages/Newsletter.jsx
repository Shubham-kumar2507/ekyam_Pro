import { useState } from 'react';
import api from '../api/api';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [unsubEmail, setUnsubEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault(); setMsg(''); setError('');
        try { const { data } = await api.post('/newsletter/subscribe', { email }); setMsg(data.message); setEmail(''); } catch (_err) { setError(_err.response?.data?.message || 'Error subscribing'); }
    };

    const handleUnsubscribe = async (e) => {
        e.preventDefault(); setMsg(''); setError('');
        try { const { data } = await api.post('/newsletter/unsubscribe', { email: unsubEmail }); setMsg(data.message); setUnsubEmail(''); } catch (_err) { setError(_err.response?.data?.message || 'Error unsubscribing'); }
    };

    const inputStyle = { flex: 1, padding: '0.85rem 1rem', border: '1px solid #d1d5db', borderRadius: '10px 0 0 10px', fontSize: '0.95rem', outline: 'none' };
    const card = { background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
            <div style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', color: '#fff', padding: '3.5rem 1rem', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <i className="fas fa-newspaper" style={{ fontSize: '1.75rem' }}></i>
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Newsletter</h1>
                <p style={{ opacity: 0.85, fontSize: '1.05rem' }}>Stay updated with EKYAM's latest news and community highlights</p>
            </div>

            <div style={{ maxWidth: '600px', margin: '-2rem auto 0', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
                {msg && <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}><i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>{msg}</div>}
                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem' }}><i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>{error}</div>}

                <div style={card}>
                    <h2 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}><i className="fas fa-envelope" style={{ color: '#4f46e5', marginRight: '0.5rem' }}></i>Subscribe</h2>
                    <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>Get weekly updates on new projects, resources, and community activities.</p>
                    <form onSubmit={handleSubscribe} style={{ display: 'flex' }}>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" style={inputStyle} required />
                        <button type="submit" style={{ padding: '0.85rem 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '0 10px 10px 0', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Subscribe</button>
                    </form>
                </div>

                <div style={{ ...card, marginTop: '1.5rem' }}>
                    <h2 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}><i className="fas fa-bell-slash" style={{ color: '#dc2626', marginRight: '0.5rem' }}></i>Unsubscribe</h2>
                    <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>No longer want to receive our newsletters?</p>
                    <form onSubmit={handleUnsubscribe} style={{ display: 'flex' }}>
                        <input type="email" value={unsubEmail} onChange={e => setUnsubEmail(e.target.value)} placeholder="Enter your email" style={inputStyle} required />
                        <button type="submit" style={{ padding: '0.85rem 1.5rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0 10px 10px 0', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Unsubscribe</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
