import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/api';

export default function Settings() {
    const { user, updateUser } = useAuth();
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [notif, setNotif] = useState({ emailNotifications: user?.emailNotifications ?? true, projectUpdates: user?.projectUpdates ?? true, communityUpdates: user?.communityUpdates ?? true });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) return setError('Passwords do not match');
        if (pwForm.newPassword.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true); setMsg(''); setError('');
        try {
            await api.put('/users/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            setMsg('Password updated successfully!');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (_err) { setError(_err.response?.data?.message || 'Error updating password'); }
        setLoading(false);
    };

    const handleNotifSave = async () => {
        try { await api.put('/users/settings', notif); updateUser(notif); setMsg('Settings saved!'); } catch { setError('Error saving settings'); }
    };

    const inputStyle = { width: '100%', padding: '0.7rem 1rem', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '0.95rem', background: '#f9fafb', outline: 'none' };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.35rem' };
    const card = { background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '3rem 1rem' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1f2937' }}><i className="fas fa-cog" style={{ color: '#6366f1', marginRight: '0.5rem' }}></i>Settings</h1>
                    <p style={{ color: '#6b7280' }}>Manage your account preferences</p>
                </div>

                {msg && <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem' }}><i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>{msg}</div>}
                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem' }}><i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>{error}</div>}

                {/* Account Info */}
                <div style={{ ...card, marginBottom: '1.5rem' }}>
                    <h2 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}><i className="fas fa-user" style={{ color: '#6366f1', marginRight: '0.5rem' }}></i>Account Information</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label style={labelStyle}>Username</label><input type="text" value={user?.username || ''} disabled style={{ ...inputStyle, background: '#e5e7eb', color: '#6b7280' }} /></div>
                        <div><label style={labelStyle}>Email</label><input type="text" value={user?.email || ''} disabled style={{ ...inputStyle, background: '#e5e7eb', color: '#6b7280' }} /></div>
                    </div>
                    <div style={{ marginTop: '0.75rem' }}><label style={labelStyle}>Account Type</label><input type="text" value={user?.userType?.replace('_', ' ') || 'individual'} disabled style={{ ...inputStyle, background: '#e5e7eb', color: '#6b7280', textTransform: 'capitalize' }} /></div>
                </div>

                {/* Password */}
                <div style={{ ...card, marginBottom: '1.5rem' }}>
                    <h2 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}><i className="fas fa-lock" style={{ color: '#6366f1', marginRight: '0.5rem' }}></i>Change Password</h2>
                    <form onSubmit={handlePasswordChange}>
                        <div style={{ marginBottom: '1rem' }}><label style={labelStyle}>Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} style={inputStyle} required /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div><label style={labelStyle}>New Password</label><input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} style={inputStyle} required /></div>
                            <div><label style={labelStyle}>Confirm</label><input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} style={inputStyle} required /></div>
                        </div>
                        <button type="submit" disabled={loading} style={{ padding: '0.7rem 1.5rem', background: loading ? '#9ca3af' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                {/* Notifications */}
                <div style={card}>
                    <h2 style={{ fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}><i className="fas fa-bell" style={{ color: '#6366f1', marginRight: '0.5rem' }}></i>Notifications</h2>
                    {[
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive general email notifications' },
                        { key: 'projectUpdates', label: 'Project Updates', desc: 'Get notified about project activities' },
                        { key: 'communityUpdates', label: 'Community Updates', desc: 'Get notified about community activities' },
                    ].map(item => (
                        <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                            <div><div style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>{item.label}</div><div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{item.desc}</div></div>
                            <label style={{ position: 'relative', width: '44px', height: '24px', display: 'inline-block' }}>
                                <input type="checkbox" checked={notif[item.key]} onChange={e => setNotif({ ...notif, [item.key]: e.target.checked })}
                                    style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: notif[item.key] ? '#4f46e5' : '#d1d5db', borderRadius: '12px', cursor: 'pointer', transition: '0.3s' }}>
                                    <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: notif[item.key] ? '23px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.3s' }}></span>
                                </span>
                            </label>
                        </div>
                    ))}
                    <button onClick={handleNotifSave} style={{ marginTop: '1rem', padding: '0.7rem 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}
