import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import api from '../api/api';
import CommentSection from './CommentSection';
import { getMediaUrl } from '../utils/media';

function timeAgo(date) {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
}

export default function PostCard({ post, onDelete, onUpdate: _onUpdate }) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [liked, setLiked] = useState(post.likes?.includes(user?._id));
    const [likeCount, setLikeCount] = useState(post.likeCount || 0);
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);
    const [shareCount, setShareCount] = useState(post.shareCount || 0);
    const [showComments, setShowComments] = useState(false);
    const [mediaIndex, setMediaIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const handleLike = async () => {
        if (!user) return;
        try {
            const { data } = await api.post(`/posts/${post._id}/like`);
            setLiked(data.liked);
            setLikeCount(data.likeCount);
        } catch (_err) { console.error(_err); }
    };

    const handleShare = async () => {
        try {
            const url = `${window.location.origin}/feed?post=${post._id}`;
            if (navigator.share) {
                await navigator.share({ title: 'Check out this post on Ekyam', url });
            } else {
                await navigator.clipboard.writeText(url);
                alert('Link copied to clipboard!');
            }
            const { data } = await api.post(`/posts/${post._id}/share`);
            setShareCount(data.shareCount);
        } catch (_err) { console.error(_err); }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await api.delete(`/posts/${post._id}`);
            onDelete?.(post._id);
        } catch (_err) { alert(_err.response?.data?.message || 'Error'); }
    };

    const openLightbox = (index) => {
        if (post.media[index]?.type !== 'video') {
            setMediaIndex(index);
            setLightboxOpen(true);
        }
    };

    const isOwner = user && post.author && (user._id === post.author._id);

    const card = {
        background: theme.bgCard,
        borderRadius: '16px',
        boxShadow: theme.shadow,
        marginBottom: '1.25rem',
        overflow: 'hidden',
        animation: 'fadeIn 0.4s ease-out',
        border: `1px solid ${theme.border}`,
        transition: 'background-color 0.3s ease'
    };

    const avatarStyle = {
        width: '44px', height: '44px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: '700', fontSize: '1.1rem',
        overflow: 'hidden', flexShrink: 0
    };

    const btnStyle = (active, color) => ({
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.5rem 1rem', border: 'none', borderRadius: '8px',
        cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
        background: active ? `${color}15` : theme.bgCardHover,
        color: active ? color : theme.textMuted,
        transition: 'all 0.2s ease'
    });

    return (
        <>
            <div style={card} id={`post-${post._id}`}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem 0.5rem' }}>
                    <Link to={`/users/${post.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                        <div style={avatarStyle}>
                            {post.author?.profileImage
                                ? <img src={getMediaUrl(post.author.profileImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : post.author?.fullName?.[0] || '?'}
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', color: theme.text, fontSize: '0.95rem' }}>{post.author?.fullName || 'Unknown'}</div>
                            <div style={{ fontSize: '0.78rem', color: theme.textFaint }}>
                                @{post.author?.username} · {timeAgo(post.createdAt)}
                            </div>
                        </div>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {post.project && (
                            <Link to={`/projects/${post.project._id || post.project}`} style={{ fontSize: '0.75rem', background: theme.name === 'dark' ? '#2e1065' : '#ede9fe', color: '#a78bfa', padding: '0.2rem 0.6rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }}>
                                📁 {post.project.name || 'Project'}
                            </Link>
                        )}
                        {post.community && (
                            <Link to={`/communities/${post.community._id || post.community}`} style={{ fontSize: '0.75rem', background: theme.name === 'dark' ? '#0c4a6e' : '#e0f2fe', color: '#38bdf8', padding: '0.2rem 0.6rem', borderRadius: '6px', textDecoration: 'none', fontWeight: '600' }}>
                                👥 {post.community.name || 'Community'}
                            </Link>
                        )}
                        {isOwner && (
                            <button onClick={handleDelete} style={{ border: 'none', background: 'none', color: theme.textFaint, cursor: 'pointer', fontSize: '1rem', padding: '0.3rem' }} title="Delete post">✕</button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {post.content && (
                    <div style={{ padding: '0.5rem 1.25rem', color: theme.textSecondary, fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                        {post.content}
                    </div>
                )}

                {/* Media */}
                {post.media && post.media.length > 0 && (
                    <div style={{ padding: '0.5rem 1.25rem' }}>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', background: theme.bgMuted }}>
                            {post.media[mediaIndex]?.type === 'video' ? (
                                <video
                                    src={getMediaUrl(post.media[mediaIndex].url)}
                                    controls
                                    style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }}
                                />
                            ) : (
                                <img
                                    src={getMediaUrl(post.media[mediaIndex].url)}
                                    alt="Post media"
                                    onClick={() => openLightbox(mediaIndex)}
                                    style={{
                                        width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block',
                                        cursor: 'pointer', transition: 'transform 0.3s ease'
                                    }}
                                />
                            )}
                            {post.media.length > 1 && (
                                <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                                    {post.media.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setMediaIndex(i)}
                                            style={{
                                                width: '8px', height: '8px', borderRadius: '50%', border: 'none',
                                                background: i === mediaIndex ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderTop: `1px solid ${theme.border}` }}>
                    <button onClick={handleLike} style={btnStyle(liked, '#ef4444')}>
                        {liked ? '❤️' : '🤍'} {likeCount}
                    </button>
                    <button onClick={() => setShowComments(!showComments)} style={btnStyle(showComments, '#6366f1')}>
                        💬 {commentCount}
                    </button>
                    <button onClick={handleShare} style={btnStyle(false, '#059669')}>
                        🔗 {shareCount}
                    </button>
                </div>

                {/* Comments */}
                {showComments && (
                    <CommentSection
                        postId={post._id}
                        onCommentCountChange={setCommentCount}
                    />
                )}
            </div>

            {/* Image Lightbox */}
            {lightboxOpen && post.media[mediaIndex]?.type !== 'video' && (
                <div
                    onClick={() => setLightboxOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.9)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        cursor: 'zoom-out', animation: 'fadeIn 0.25s ease-out'
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        style={{
                            position: 'absolute', top: '1.5rem', right: '1.5rem',
                            background: 'rgba(255,255,255,0.15)', border: 'none',
                            color: '#fff', fontSize: '1.5rem', cursor: 'pointer',
                            width: '44px', height: '44px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(8px)',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        <i className="fas fa-times"></i>
                    </button>

                    {/* Navigation arrows for multi-media */}
                    {post.media.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMediaIndex(i => (i - 1 + post.media.length) % post.media.length); }}
                                style={{
                                    position: 'absolute', left: '1.5rem', background: 'rgba(255,255,255,0.15)',
                                    border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer',
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backdropFilter: 'blur(8px)'
                                }}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setMediaIndex(i => (i + 1) % post.media.length); }}
                                style={{
                                    position: 'absolute', right: '1.5rem', background: 'rgba(255,255,255,0.15)',
                                    border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer',
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backdropFilter: 'blur(8px)'
                                }}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </>
                    )}

                    <img
                        src={getMediaUrl(post.media[mediaIndex].url)}
                        alt="Full size"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain',
                            borderRadius: '8px', cursor: 'default',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.5)'
                        }}
                    />

                    {/* Image counter */}
                    {post.media.length > 1 && (
                        <div style={{
                            position: 'absolute', bottom: '1.5rem',
                            background: 'rgba(0,0,0,0.6)', color: '#fff',
                            padding: '0.3rem 0.8rem', borderRadius: '20px',
                            fontSize: '0.8rem', fontWeight: '600',
                            backdropFilter: 'blur(8px)'
                        }}>
                            {mediaIndex + 1} / {post.media.length}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
