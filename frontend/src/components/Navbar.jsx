import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, mode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);
    const dropRef = useRef(null);

    const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
        };
        if (dropOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        const id = setTimeout(() => { setMenuOpen(false); setDropOpen(false); }, 0);
        return () => clearTimeout(id);
    }, [location.pathname]);

    const isHome = location.pathname === '/';
    const isLightHome = isHome && mode === 'light';

    const navStyle = { 
        background: isHome ? (mode === 'light' ? 'rgba(245, 244, 240, 0.85)' : 'rgba(9, 9, 13, 0.85)') : theme.navBg, 
        backdropFilter: isHome ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: isHome ? 'blur(12px)' : 'none',
        borderBottom: isHome ? `1px solid ${isLightHome ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}` : 'none',
        color: isLightHome ? '#1f2937' : '#fff', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        boxShadow: isHome ? 'none' : '0 2px 12px rgba(0,0,0,0.15)', 
        transition: 'all 0.3s ease' 
    };
    
    const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
    const logoStyle = { color: isLightHome ? '#1f2937' : '#fff', textDecoration: 'none', fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '1px' };

    const navLinks = [
        { to: user ? '/dashboard' : '/', label: 'Home' },
        { to: '/projects', label: 'Projects' },
        { to: '/resources', label: 'Resources' },
        { to: '/communities', label: 'Communities' },
        ...(user ? [{ to: '/feed', label: 'Feed' }, { to: '/network', label: 'Network' }] : []),
        ...(user?.userType === 'system_admin' ? [{ to: '/admin', label: 'Admin' }] : []),
        { to: '/map', label: 'Map' },
        { to: '/contact', label: 'Contact' },
    ];

    const isActive = (to) => {
        if (to === '/' || to === '/dashboard') return location.pathname === to;
        return location.pathname.startsWith(to);
    };

    const getLinkStyle = (to) => ({
        color: isActive(to) ? (isLightHome ? '#4f46e5' : '#fff') : (isHome ? (isLightHome ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)') : theme.navText),
        textDecoration: 'none',
        fontWeight: isActive(to) ? '700' : '500',
        fontSize: '0.95rem',
        padding: '0.25rem 0',
        borderBottom: isActive(to) ? `2px solid ${isLightHome ? '#4f46e5' : '#fff'}` : '2px solid transparent',
        transition: 'color 0.15s ease, border-color 0.15s ease'
    });

    const themeToggleBtn = (
        <button onClick={toggleTheme}
            title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{
                background: isLightHome ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)', 
                border: `1px solid ${isLightHome ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.25)'}`,
                color: isLightHome ? '#1f2937' : '#fff', padding: '0.4rem 0.55rem', borderRadius: '8px', cursor: 'pointer',
                fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s, transform 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = isLightHome ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'rotate(15deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isLightHome ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
        >
            <i className={mode === 'light' ? 'fas fa-moon' : 'fas fa-sun'} style={{ fontSize: '0.9rem' }}></i>
        </button>
    );

    return (
        <nav style={navStyle}>
            <div style={containerStyle}>
                <Link to={user ? '/dashboard' : '/'} style={logoStyle}>
                    <i className="fas fa-people-group"></i> EKYAM
                </Link>

                {/* Desktop Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                    className="desktop-nav">
                    {navLinks.map(l => (
                        <Link key={l.to + l.label} to={l.to} style={getLinkStyle(l.to)}
                            onMouseEnter={e => { if (!isActive(l.to)) e.target.style.color = isLightHome ? '#4f46e5' : '#fff'; }}
                            onMouseLeave={e => { if (!isActive(l.to)) e.target.style.color = (isHome ? (isLightHome ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)') : theme.navText); }}>
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Auth + Theme Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {themeToggleBtn}
                    {user && <NotificationDropdown isLightHome={isLightHome} />}
                    {user ? (
                        <div style={{ position: 'relative' }} ref={dropRef}>
                            <button onClick={() => setDropOpen(!dropOpen)}
                                style={{ background: isLightHome ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)', border: `1px solid ${isLightHome ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.25)'}`, color: isLightHome ? '#1f2937' : '#fff', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = isLightHome ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.25)'}
                                onMouseLeave={e => e.currentTarget.style.background = isLightHome ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)'}
                            >
                                <i className="fas fa-user-circle"></i>
                                {user.username}
                                <i className={`fas fa-chevron-${dropOpen ? 'up' : 'down'}`} style={{ fontSize: '0.65rem', transition: 'transform 0.2s' }}></i>
                            </button>
                            {dropOpen && (
                                <div style={{
                                    position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem',
                                    background: theme.navDropBg, borderRadius: '12px', boxShadow: theme.shadowLg,
                                    width: '220px', overflow: 'hidden', zIndex: 100,
                                    border: `1px solid ${theme.border}`,
                                    animation: 'fadeIn 0.2s ease-out'
                                }}>
                                    {/* User info header */}
                                    <div style={{ padding: '1rem', borderBottom: `1px solid ${theme.navDropBorder}`, background: theme.bgCardHover }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: theme.text }}>{user.fullName || user.username}</div>
                                        <div style={{ fontSize: '0.75rem', color: theme.textFaint }}>@{user.username}</div>
                                    </div>
                                    {[{ to: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
                                    { to: '/notifications', icon: 'fas fa-bell', label: 'Notifications' },
                                    { to: '/profile', icon: 'fas fa-user', label: 'Profile' },
                                    { to: '/settings', icon: 'fas fa-cog', label: 'Settings' },
                                    ...(user?.userType === 'system_admin' ? [{ to: '/admin', icon: 'fas fa-shield-alt', label: 'Admin Panel' }] : []),
                                    ].map(item => (
                                        <Link key={item.to} to={item.to} onClick={() => setDropOpen(false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: theme.navDropText, textDecoration: 'none', fontSize: '0.9rem', borderBottom: `1px solid ${theme.navDropBorder}`, transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = theme.navDropHover}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <i className={item.icon} style={{ color: theme.accent, width: '18px', textAlign: 'center' }}></i>
                                            {item.label}
                                        </Link>
                                    ))}
                                    <button onClick={handleLogout}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', color: theme.error, background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = theme.errorBg}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <i className="fas fa-sign-out-alt" style={{ width: '18px', textAlign: 'center' }}></i>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: isHome ? (isLightHome ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)') : theme.navText, textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}
                                onMouseEnter={e => e.target.style.color = isLightHome ? '#4f46e5' : '#fff'}
                                onMouseLeave={e => e.target.style.color = isHome ? (isLightHome ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)') : theme.navText}>
                                Login
                            </Link>
                            <Link to="/register"
                                style={{ background: isLightHome ? '#4f46e5' : '#fff', color: isLightHome ? '#fff' : '#4338ca', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', transition: 'background 0.2s, transform 0.2s' }}
                                onMouseEnter={e => { e.target.style.background = isLightHome ? '#4338ca' : '#e0e7ff'; e.target.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.target.style.background = isLightHome ? '#4f46e5' : '#fff'; e.target.style.transform = 'translateY(0)'; }}>
                                Join Us
                            </Link>
                        </>
                    )}

                    {/* Mobile burger */}
                    <button onClick={() => setMenuOpen(!menuOpen)}
                        className="mobile-burger"
                        style={{ background: 'transparent', border: 'none', color: isLightHome ? '#1f2937' : '#fff', fontSize: '1.25rem', cursor: 'pointer', display: 'none' }}>
                        <i className={`fas fa-${menuOpen ? 'times' : 'bars'}`}></i>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div style={{ background: theme.navMobileBg, padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }} className="mobile-menu">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {navLinks.map(l => (
                            <Link key={l.to + l.label} to={l.to} onClick={() => setMenuOpen(false)}
                                style={{
                                    color: isActive(l.to) ? '#fff' : (isHome ? 'rgba(255,255,255,0.7)' : theme.navText),
                                    textDecoration: 'none', padding: '0.7rem 0.75rem', borderRadius: '8px',
                                    fontWeight: isActive(l.to) ? '700' : '500',
                                    background: isActive(l.to) ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    transition: 'background 0.15s'
                                }}
                                onMouseEnter={e => { if (!isActive(l.to)) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                onMouseLeave={e => { if (!isActive(l.to)) e.currentTarget.style.background = 'transparent'; }}>
                                {l.label}
                            </Link>
                        ))}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
                        {user ? (
                            <>
                                <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ color: theme.navText, textDecoration: 'none', padding: '0.7rem 0.75rem', borderRadius: '8px' }}>Dashboard</Link>
                                <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ color: theme.navText, textDecoration: 'none', padding: '0.7rem 0.75rem', borderRadius: '8px' }}>Profile</Link>
                                <Link to="/settings" onClick={() => setMenuOpen(false)} style={{ color: theme.navText, textDecoration: 'none', padding: '0.7rem 0.75rem', borderRadius: '8px' }}>Settings</Link>
                                <button onClick={handleLogout} style={{ color: '#fca5a5', background: 'transparent', border: 'none', textAlign: 'left', padding: '0.7rem 0.75rem', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '8px' }}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ color: theme.navText, textDecoration: 'none', padding: '0.7rem 0.75rem' }}>Login</Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', padding: '0.7rem 0.75rem', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontWeight: '600', textAlign: 'center', marginTop: '0.25rem' }}>Join Us</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
