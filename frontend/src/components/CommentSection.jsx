import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';

function timeAgo(date) {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
}

export default function CommentSection({ postId, onCommentCountChange }) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get(`/posts/${postId}/comments`)
            .then(r => setComments(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || submitting) return;
        setSubmitting(true);
        try {
            const { data } = await api.post(`/posts/${postId}/comments`, { content: content.trim() });
            setComments(prev => [...prev, data]);
            setContent('');
            onCommentCountChange?.(comments.length + 1);
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    const handleDelete = async (commentId) => {
        try {
            await api.delete(`/posts/${postId}/comments/${commentId}`);
            const updated = comments.filter(c => c._id !== commentId);
            setComments(updated);
            onCommentCountChange?.(updated.length);
        } catch (err) { console.error(err); }
    };

    const avatarSmall = {
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: '600', fontSize: '0.8rem',
        overflow: 'hidden', flexShrink: 0
    };

    return (
        <div style={{ borderTop: `1px solid ${theme.border}`, padding: '1rem 1.25rem', background: theme.bgCardHover, transition: 'background-color 0.3s ease' }}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: theme.textFaint, fontSize: '0.85rem' }}>Loading comments...</div>
            ) : (
                <>
                    {comments.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '0.75rem', color: theme.textFaint, fontSize: '0.85rem' }}>No comments yet. Be the first!</div>
                    )}
                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {comments.map(comment => (
                            <div key={comment._id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                                <Link to={`/users/${comment.author?._id}`} style={{ textDecoration: 'none' }}>
                                    <div style={avatarSmall}>
                                        {comment.author?.profileImage
                                            ? <img src={getMediaUrl(comment.author.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : comment.author?.fullName?.[0] || '?'}
                                    </div>
                                </Link>
                                <div style={{ flex: 1, background: theme.bgCard, padding: '0.6rem 0.85rem', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                        <Link to={`/users/${comment.author?._id}`} style={{ fontWeight: '600', fontSize: '0.82rem', color: theme.text, textDecoration: 'none' }}>
                                            {comment.author?.fullName || 'Unknown'}
                                        </Link>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.72rem', color: theme.textFaint }}>{timeAgo(comment.createdAt)}</span>
                                            {user && comment.author?._id === user._id && (
                                                <button onClick={() => handleDelete(comment._id)} style={{ border: 'none', background: 'none', color: theme.textFaint, cursor: 'pointer', fontSize: '0.75rem', padding: '0' }}>✕</button>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add Comment Form */}
            {user && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
                    <div style={avatarSmall}>
                        {user.profileImage
                            ? <img src={getMediaUrl(user.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : user.fullName?.[0] || '?'}
                    </div>
                    <input
                        type="text"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Write a comment..."
                        style={{
                            flex: 1, padding: '0.55rem 0.85rem', border: `1px solid ${theme.border}`,
                            borderRadius: '20px', fontSize: '0.85rem', background: theme.bgInput,
                            color: theme.text, outline: 'none', transition: 'border-color 0.2s'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!content.trim() || submitting}
                        style={{
                            padding: '0.55rem 1rem', border: 'none', borderRadius: '20px',
                            background: content.trim() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : theme.bgMuted,
                            color: content.trim() ? '#fff' : theme.textFaint,
                            fontWeight: '600', fontSize: '0.85rem', cursor: content.trim() ? 'pointer' : 'default',
                            transition: 'all 0.2s'
                        }}
                    >
                        {submitting ? '...' : 'Post'}
                    </button>
                </form>
            )}
        </div>
    );
}
