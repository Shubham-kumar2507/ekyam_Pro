import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';

export default function CommunityChat() {
    const { id } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [community, setCommunity] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showMembers, setShowMembers] = useState(true);
    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await api.get(`/chat/${id}/messages`);
            setMessages(res.data);
        } catch { /* silently ignore */ }
    }, [id]);

    useEffect(() => {
        const init = async () => {
            try {
                const [cRes, mRes] = await Promise.allSettled([
                    api.get(`/communities/${id}`),
                    api.get(`/chat/${id}/online`),
                ]);
                if (cRes.status === 'fulfilled') setCommunity(cRes.value.data);
                if (mRes.status === 'fulfilled') setMembers(mRes.value.data);
                await fetchMessages();
            } catch { /* silently ignore */ }
            setLoading(false);
        };
        init();
        intervalRef.current = setInterval(fetchMessages, 15000);
        return () => clearInterval(intervalRef.current);
    }, [id, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await api.post(`/chat/${id}/messages`, { message: newMessage });
            setMessages(prev => [...prev, res.data]);
            setNewMessage('');
        } catch { /* silently ignore */ }
    };

    const imgUrl = (img) => getMediaUrl(img);

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#4f46e5' }}></i></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', background: '#f3f4f6' }}>
            {/* Chat Header */}
            <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link to={`/communities/${id}`} style={{ color: '#4f46e5', fontSize: '1.1rem' }}><i className="fas fa-arrow-left"></i></Link>
                    {community?.image ? (
                        <img src={imgUrl(community.image)} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '40px', height: '40px', background: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-users" style={{ color: '#6366f1' }}></i>
                        </div>
                    )}
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{community?.name} Chat</h1>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{members.length} members</p>
                    </div>
                </div>
                <button onClick={() => setShowMembers(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '1.1rem' }}>
                    <i className="fas fa-users"></i>
                </button>
            </header>

            {/* Chat Body */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Messages Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                        {messages.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                                    <i className="fas fa-comments" style={{ fontSize: '3rem', marginBottom: '0.75rem', display: 'block' }}></i>
                                    <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No messages yet</h3>
                                    <p>Be the first to start a conversation!</p>
                                </div>
                            </div>
                        ) : (
                            messages.map(msg => {
                                const isOwn = msg.userId?._id === user?._id || msg.userId === user?._id;
                                const senderImg = imgUrl(msg.userId?.profileImage);
                                return (
                                    <div key={msg._id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
                                        {!isOwn && (
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '0.5rem', flexShrink: 0, overflow: 'hidden' }}>
                                                {senderImg ? <img src={senderImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <div style={{ width: '100%', height: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-user" style={{ fontSize: '0.7rem', color: '#9ca3af' }}></i></div>}
                                            </div>
                                        )}
                                        <div style={{ maxWidth: '65%' }}>
                                            {!isOwn && <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.2rem' }}>{msg.userId?.fullName || msg.userId?.username}</div>}
                                            <div style={{ background: isOwn ? '#4f46e5' : '#fff', color: isOwn ? '#fff' : '#1f2937', padding: '0.6rem 1rem', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', wordBreak: 'break-word', lineHeight: '1.5', fontSize: '0.9rem' }}>
                                                {msg.message}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.25rem', textAlign: isOwn ? 'right' : 'left' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {isOwn && (
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', marginLeft: '0.5rem', flexShrink: 0, overflow: 'hidden' }}>
                                                {imgUrl(user?.profileImage) ? <img src={imgUrl(user.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <div style={{ width: '100%', height: '100%', background: '#c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-user" style={{ fontSize: '0.7rem', color: '#4f46e5' }}></i></div>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSend} style={{ borderTop: '1px solid #e5e7eb', padding: '0.75rem 1.5rem', background: '#fff', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <input
                            type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '24px', padding: '0.6rem 1rem', fontSize: '0.9rem', outline: 'none' }}
                        />
                        <button type="submit" style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>

                {/* Members Sidebar */}
                {showMembers && (
                    <div style={{ width: '240px', background: '#fff', borderLeft: '1px solid #e5e7eb', padding: '1rem', overflowY: 'auto', flexShrink: 0 }}>
                        <h2 style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '1rem' }}>Members</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {members.map(m => (
                                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden' }}>
                                            {imgUrl(m.profileImage) ? <img src={imgUrl(m.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <div style={{ width: '100%', height: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-user" style={{ fontSize: '0.65rem', color: '#9ca3af' }}></i></div>}
                                        </div>
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid #fff' }}></div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{m.fullName}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>@{m.username}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                            <Link to={`/communities/${id}/members`} style={{ color: '#4f46e5', fontSize: '0.8rem', textDecoration: 'none' }}>
                                <i className="fas fa-users" style={{ marginRight: '0.3rem' }}></i>View All Members
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
