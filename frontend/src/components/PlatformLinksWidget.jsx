import { useState, useEffect } from 'react';
import api from '../api/api';

// ─── Platform Config ───
const PLATFORMS = [
    { key: 'github', label: 'GitHub', icon: 'fab fa-github', color: '#333', darkColor: '#f0f0f0', hasStats: true },
    { key: 'leetcode', label: 'LeetCode', icon: 'fas fa-code', color: '#FFA116', darkColor: '#FFA116', hasStats: true },
    { key: 'codeforces', label: 'Codeforces', icon: 'fas fa-trophy', color: '#1F8ACB', darkColor: '#5CB8FF', hasStats: true },
    { key: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0A66C2', darkColor: '#4D9FE8', hasStats: false },
    { key: 'twitter', label: 'Twitter / X', icon: 'fab fa-twitter', color: '#1DA1F2', darkColor: '#1DA1F2', hasStats: false },
    { key: 'kaggle', label: 'Kaggle', icon: 'fas fa-chart-bar', color: '#20BEFF', darkColor: '#20BEFF', hasStats: false },
    { key: 'medium', label: 'Medium', icon: 'fab fa-medium', color: '#000', darkColor: '#fff', hasStats: true },
    { key: 'portfolio', label: 'Portfolio', icon: 'fas fa-globe', color: '#6366f1', darkColor: '#818cf8', hasStats: false },
];

// ─── Stats Formatters ───
function formatStats(platform, stats) {
    if (!stats) return [];
    switch (platform) {
        case 'github':
            return [
                { icon: 'fas fa-book', label: `${stats.publicRepos || 0} repos` },
                { icon: 'fas fa-star', label: `${stats.totalStars || 0} stars` },
                { icon: 'fas fa-users', label: `${stats.followers || 0} followers` },
            ];
        case 'leetcode':
            return [
                { icon: 'fas fa-check-circle', label: `${stats.totalSolved || 0} solved` },
                { icon: 'fas fa-signal', label: `#${stats.ranking || '—'}` },
                { icon: 'fas fa-layer-group', label: `E:${stats.easySolved || 0} M:${stats.mediumSolved || 0} H:${stats.hardSolved || 0}` },
            ];
        case 'codeforces':
            return [
                { icon: 'fas fa-chart-line', label: `${stats.rating || 0} rating` },
                { icon: 'fas fa-medal', label: `${stats.rank || 'unrated'}` },
                { icon: 'fas fa-arrow-up', label: `max ${stats.maxRating || 0}` },
            ];
        case 'medium':
            return [
                { icon: 'fas fa-newspaper', label: `${stats.recentArticles || 0} articles` },
            ];
        default:
            return [];
    }
}

export default function PlatformLinksWidget({ socialLinks, theme, showStats = true, compact = false }) {
    const [stats, setStats] = useState({});
    const [loadingStats, setLoadingStats] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const connectedPlatforms = PLATFORMS.filter(p => socialLinks?.[p.key]);
    const isDark = theme?.name === 'dark';

    useEffect(() => {
        if (showStats && connectedPlatforms.some(p => p.hasStats)) {
            fetchAllStats();
        }
    }, [socialLinks]);

    const fetchAllStats = async (forceRefresh = false) => {
        setLoadingStats(true);
        try {
            const url = forceRefresh ? '/platform-stats/all/me?refresh=true' : '/platform-stats/all/me';
            const { data } = await api.get(url);
            setStats(data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch platform stats:', err);
        }
        setLoadingStats(false);
    };

    const getLink = (platform) => {
        const val = socialLinks?.[platform.key];
        if (!val) return '#';
        if (val.startsWith('http')) return val;
        // Build URL from username
        const urlMap = {
            github: `https://github.com/${val}`,
            leetcode: `https://leetcode.com/u/${val}`,
            codeforces: `https://codeforces.com/profile/${val}`,
            linkedin: `https://linkedin.com/in/${val}`,
            twitter: `https://x.com/${val}`,
            kaggle: `https://kaggle.com/${val}`,
            medium: `https://medium.com/@${val}`,
            portfolio: val,
        };
        return urlMap[platform.key] || val;
    };

    if (connectedPlatforms.length === 0) {
        if (compact) return null;
        return (
            <div style={{
                background: theme?.bgCard || '#fff',
                borderRadius: '8px',
                boxShadow: theme?.shadow || '0 2px 10px rgba(0,0,0,0.05)',
                padding: '1.5rem',
                border: `1px solid ${theme?.border || '#e5e7eb'}`,
                textAlign: 'center',
                transition: 'background-color 0.3s ease',
            }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: theme?.accentLight || '#eef2ff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem',
                }}>
                    <i className="fas fa-link" style={{ fontSize: '1.2rem', color: theme?.accentText || '#4f46e5' }}></i>
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: theme?.text || '#1f2937', marginBottom: '0.25rem' }}>
                    Connect Platforms
                </h3>
                <p style={{ color: theme?.textFaint || '#9ca3af', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    Link your professional profiles
                </p>
                <a href="/profile" style={{
                    color: theme?.accentText || '#4f46e5', fontSize: '0.8rem',
                    fontWeight: '600', textDecoration: 'none',
                }}>
                    Add Links →
                </a>
            </div>
        );
    }

    // ─── Compact mode: just icons row (for public profile header) ───
    if (compact) {
        return (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {connectedPlatforms.map(p => (
                    <a
                        key={p.key}
                        href={getLink(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={p.label}
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', textDecoration: 'none',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                            e.currentTarget.style.transform = 'scale(1.15)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <i className={p.icon} style={{ color: '#fff', fontSize: '0.95rem' }}></i>
                    </a>
                ))}
            </div>
        );
    }

    // ─── Full widget mode (for dashboard) ───
    return (
        <div style={{
            background: theme?.bgCard || '#fff',
            borderRadius: '8px',
            boxShadow: theme?.shadow || '0 2px 10px rgba(0,0,0,0.05)',
            padding: '1.25rem',
            border: `1px solid ${theme?.border || '#e5e7eb'}`,
            transition: 'background-color 0.3s ease',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: '600', color: theme?.text || '#1f2937' }}>
                    <i className="fas fa-link" style={{ color: theme?.accentText || '#4f46e5', marginRight: '0.4rem', fontSize: '0.85rem' }}></i>
                    Platforms
                </h2>
                {showStats && (
                    <button
                        onClick={() => fetchAllStats(true)}
                        disabled={loadingStats}
                        style={{
                            background: 'none', border: 'none', cursor: loadingStats ? 'wait' : 'pointer',
                            color: theme?.textFaint || '#9ca3af', fontSize: '0.75rem', padding: '0.2rem',
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                        }}
                        title="Refresh stats"
                    >
                        <i className={`fas fa-sync-alt ${loadingStats ? 'fa-spin' : ''}`} style={{ fontSize: '0.7rem' }}></i>
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {connectedPlatforms.map(p => {
                    const platformStats = stats[p.key]?.stats;
                    const formattedStats = showStats ? formatStats(p.key, platformStats) : [];
                    const platformColor = isDark ? p.darkColor : p.color;

                    return (
                        <a
                            key={p.key}
                            href={getLink(p)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.65rem',
                                padding: '0.6rem 0.75rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: theme?.text || '#1f2937',
                                border: `1px solid ${theme?.border || '#e5e7eb'}`,
                                transition: 'all 0.2s',
                                background: 'transparent',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = platformColor;
                                e.currentTarget.style.boxShadow = `0 0 0 1px ${platformColor}22`;
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = theme?.border || '#e5e7eb';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: `${platformColor}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <i className={p.icon} style={{ color: platformColor, fontSize: '0.9rem' }}></i>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontWeight: '600', fontSize: '0.82rem',
                                    color: theme?.text || '#1f2937',
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                }}>
                                    {p.label}
                                    <i className="fas fa-external-link-alt" style={{
                                        fontSize: '0.55rem', color: theme?.textFaint || '#9ca3af', opacity: 0.6,
                                    }}></i>
                                </div>

                                {/* Stats line */}
                                {showStats && p.hasStats && (
                                    <div style={{
                                        fontSize: '0.7rem', color: theme?.textFaint || '#9ca3af',
                                        marginTop: '0.15rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
                                    }}>
                                        {loadingStats && !platformStats ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <i className="fas fa-spinner fa-spin" style={{ fontSize: '0.6rem' }}></i>
                                                Loading...
                                            </span>
                                        ) : formattedStats.length > 0 ? (
                                            formattedStats.map((s, i) => (
                                                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                    <i className={s.icon} style={{ fontSize: '0.6rem', opacity: 0.7 }}></i>
                                                    {s.label}
                                                </span>
                                            ))
                                        ) : !loadingStats ? (
                                            <span>View profile →</span>
                                        ) : null}
                                    </div>
                                )}

                                {/* Non-stats platforms */}
                                {!p.hasStats && (
                                    <div style={{ fontSize: '0.7rem', color: theme?.textFaint || '#9ca3af', marginTop: '0.1rem' }}>
                                        View profile →
                                    </div>
                                )}
                            </div>
                        </a>
                    );
                })}
            </div>

            {/* Last updated */}
            {showStats && lastUpdated && (
                <div style={{
                    fontSize: '0.65rem', color: theme?.textFaint || '#9ca3af',
                    textAlign: 'center', marginTop: '0.75rem', opacity: 0.7,
                }}>
                    Updated {getTimeAgo(lastUpdated)}
                </div>
            )}
        </div>
    );
}

// ─── Utility ───
function getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export { PLATFORMS };
