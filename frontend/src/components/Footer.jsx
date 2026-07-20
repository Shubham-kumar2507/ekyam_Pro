import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/api';
import { useTheme } from '../context/useTheme';

export default function Footer() {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/newsletter/subscribe', { email });
            setMsg(data.message); setEmail('');
        } catch (_err) { setMsg(_err.response?.data?.message || 'Error subscribing'); }
    };

    const footerStyle = { background: theme.footerBg, color: '#fff', padding: '3rem 0 0', transition: 'background-color 0.3s ease' };
    const gridStyle = { maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' };
    const headingStyle = { fontWeight: '700', fontSize: '1rem', marginBottom: '1rem' };
    const linkItemStyle = { color: theme.footerText, textDecoration: 'none', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' };
    const bottomStyle = { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem', borderTop: `1px solid ${theme.footerBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' };

    return (
        <footer style={footerStyle}>
            <div style={gridStyle}>
                <div>
                    <h3 style={{ ...headingStyle, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fas fa-people-group"></i> EKYAM
                    </h3>
                    <p style={{ color: theme.footerText, fontSize: '0.9rem', lineHeight: '1.7' }}>
                        Fostering unity and collaboration among diverse communities through shared resources and projects.
                    </p>
                </div>

                <div>
                    <h4 style={headingStyle}>Quick Links</h4>
                    <Link to="/" style={linkItemStyle}>Home</Link>
                    <Link to="/projects" style={linkItemStyle}>Projects</Link>
                    <Link to="/resources" style={linkItemStyle}>Resources</Link>
                    <Link to="/communities" style={linkItemStyle}>Communities</Link>
                    <Link to="/map" style={linkItemStyle}>Community Map</Link>
                </div>

                <div>
                    <h4 style={headingStyle}>Support</h4>
                    <Link to="/contact" style={linkItemStyle}>Contact Us</Link>
                    <Link to="/faq" style={linkItemStyle}>FAQ</Link>
                    <Link to="/help" style={linkItemStyle}>Help Center</Link>
                    <Link to="/guidelines" style={linkItemStyle}>Guidelines</Link>
                    <Link to="/newsletter" style={linkItemStyle}>Newsletter</Link>
                </div>

                <div>
                    <h4 style={headingStyle}>Stay Updated</h4>
                    <form onSubmit={handleSubscribe}>
                        <div style={{ display: 'flex' }}>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email"
                                style={{ flex: 1, padding: '0.5rem 0.75rem', border: 'none', borderRadius: '6px 0 0 6px', fontSize: '0.9rem', color: '#1f2937', outline: 'none' }} required />
                            <button type="submit" style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '0 6px 6px 0', cursor: 'pointer' }}>
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        {msg && <p style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '0.35rem' }}>{msg}</p>}
                    </form>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                        {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                            <a key={social} href="#" style={{ color: theme.footerText, fontSize: '1.2rem', textDecoration: 'none' }}
                                onMouseEnter={e => e.target.style.color = '#fff'}
                                onMouseLeave={e => e.target.style.color = theme.footerText}>
                                <i className={`fab fa-${social}`}></i>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div style={bottomStyle}>
                <p style={{ color: theme.footerText, fontSize: '0.85rem' }}>© {new Date().getFullYear()} EKYAM. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link to="/privacy-policy" style={{ color: theme.footerText, fontSize: '0.85rem', textDecoration: 'none' }}>Privacy Policy</Link>
                    <Link to="/terms-of-service" style={{ color: theme.footerText, fontSize: '0.85rem', textDecoration: 'none' }}>Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
