const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── Helper: Extract username from URL or raw input ───
function extractUsername(input) {
    if (!input) return null;
    input = input.trim().replace(/\/+$/, ''); // remove trailing slashes
    // If it looks like a URL, extract the last path segment
    try {
        const url = new URL(input);
        const parts = url.pathname.split('/').filter(Boolean);
        // For medium, handle @username format
        const last = parts[parts.length - 1] || '';
        return last.replace(/^@/, '');
    } catch {
        // Not a URL, treat as raw username
        return input.replace(/^@/, '');
    }
}

// ─── Platform Fetchers ───

async function fetchGitHubStats(username) {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }
    const { data } = await axios.get(`https://api.github.com/users/${username}`, { headers, timeout: 10000 });

    // Fetch total stars across all repos (up to 100 most recent)
    let totalStars = 0;
    try {
        const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers, timeout: 10000 });
        totalStars = reposRes.data.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    } catch { /* ignore stars fetch failure */ }

    return {
        publicRepos: data.public_repos || 0,
        followers: data.followers || 0,
        following: data.following || 0,
        totalStars,
        avatarUrl: data.avatar_url || '',
        bio: data.bio || '',
        profileUrl: data.html_url || '',
    };
}

async function fetchLeetCodeStats(username) {
    const query = `
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    ranking
                    reputation
                }
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }
    `;
    const { data } = await axios.post('https://leetcode.com/graphql', {
        query,
        variables: { username }
    }, {
        headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
        timeout: 10000
    });

    const user = data?.data?.matchedUser;
    if (!user) throw new Error('LeetCode user not found');

    const submissions = user.submitStatsGlobal?.acSubmissionNum || [];
    const totalSolved = submissions.find(s => s.difficulty === 'All')?.count || 0;
    const easySolved = submissions.find(s => s.difficulty === 'Easy')?.count || 0;
    const mediumSolved = submissions.find(s => s.difficulty === 'Medium')?.count || 0;
    const hardSolved = submissions.find(s => s.difficulty === 'Hard')?.count || 0;

    return {
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        ranking: user.profile?.ranking || 0,
        reputation: user.profile?.reputation || 0,
        profileUrl: `https://leetcode.com/u/${username}`,
    };
}

async function fetchCodeforcesStats(handle) {
    const { data } = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`, { timeout: 10000 });

    if (data.status !== 'OK' || !data.result || data.result.length === 0) {
        throw new Error('Codeforces user not found');
    }

    const user = data.result[0];
    return {
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || 'unrated',
        maxRank: user.maxRank || 'unrated',
        contribution: user.contribution || 0,
        friendOfCount: user.friendOfCount || 0,
        profileUrl: `https://codeforces.com/profile/${handle}`,
    };
}

async function fetchMediumStats(username) {
    // Medium RSS feed returns recent articles
    const { data } = await axios.get(`https://medium.com/feed/@${username}`, {
        timeout: 10000,
        headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' }
    });

    // Count <item> tags for article count
    const articleCount = (data.match(/<item>/g) || []).length;
    // Extract titles
    const titles = [];
    const titleMatches = data.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/g);
    for (const match of titleMatches) {
        if (titles.length < 5) titles.push(match[1]);
    }

    return {
        recentArticles: articleCount,
        recentTitles: titles,
        profileUrl: `https://medium.com/@${username}`,
    };
}

// ─── Supported platforms map ───
const FETCHERS = {
    github: fetchGitHubStats,
    leetcode: fetchLeetCodeStats,
    codeforces: fetchCodeforcesStats,
    medium: fetchMediumStats,
};

// ─── GET /api/platform-stats/:platform/:username ───
// Fetches live stats with 1-hour caching
router.get('/:platform/:username', protect, async (req, res) => {
    try {
        const { platform, username } = req.params;
        const forceRefresh = req.query.refresh === 'true';

        if (!FETCHERS[platform]) {
            return res.status(400).json({
                message: `Unsupported platform: ${platform}. Supported: ${Object.keys(FETCHERS).join(', ')}`
            });
        }

        const cleanUsername = extractUsername(username);
        if (!cleanUsername) {
            return res.status(400).json({ message: 'Invalid username or URL' });
        }

        // Check cache (unless force refresh)
        if (!forceRefresh) {
            const user = await User.findById(req.user._id);
            const cached = user?.platformStatsCache?.[platform];
            if (cached?.stats && cached?.fetchedAt) {
                const age = Date.now() - new Date(cached.fetchedAt).getTime();
                if (age < CACHE_TTL_MS) {
                    return res.json({
                        platform,
                        username: cleanUsername,
                        stats: cached.stats,
                        fetchedAt: cached.fetchedAt,
                        cached: true,
                    });
                }
            }
        }

        // Fetch fresh stats
        const fetcher = FETCHERS[platform];
        let stats;
        try {
            stats = await fetcher(cleanUsername);
        } catch (apiErr) {
            // If API fails, try returning stale cache
            const user = await User.findById(req.user._id);
            const stale = user?.platformStatsCache?.[platform];
            if (stale?.stats) {
                return res.json({
                    platform,
                    username: cleanUsername,
                    stats: stale.stats,
                    fetchedAt: stale.fetchedAt,
                    cached: true,
                    stale: true,
                    warning: `Could not fetch fresh data: ${apiErr.message}`,
                });
            }
            return res.status(502).json({
                message: `Failed to fetch stats from ${platform}: ${apiErr.message}`
            });
        }

        // Save to cache
        const cacheUpdate = {};
        cacheUpdate[`platformStatsCache.${platform}.stats`] = stats;
        cacheUpdate[`platformStatsCache.${platform}.fetchedAt`] = new Date();
        await User.findByIdAndUpdate(req.user._id, { $set: cacheUpdate });

        res.json({
            platform,
            username: cleanUsername,
            stats,
            fetchedAt: new Date(),
            cached: false,
        });
    } catch (err) {
        console.error('Platform stats error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// ─── GET /api/platform-stats/all ───
// Fetches stats for all connected platforms at once
router.get('/all/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const socialLinks = user.socialLinks || {};
        const results = {};
        const forceRefresh = req.query.refresh === 'true';

        const promises = Object.entries(FETCHERS).map(async ([platform, fetcher]) => {
            const link = socialLinks[platform];
            if (!link) return;

            const cleanUsername = extractUsername(link);
            if (!cleanUsername) return;

            // Check cache first
            if (!forceRefresh) {
                const cached = user.platformStatsCache?.[platform];
                if (cached?.stats && cached?.fetchedAt) {
                    const age = Date.now() - new Date(cached.fetchedAt).getTime();
                    if (age < CACHE_TTL_MS) {
                        results[platform] = {
                            username: cleanUsername,
                            stats: cached.stats,
                            fetchedAt: cached.fetchedAt,
                            cached: true,
                        };
                        return;
                    }
                }
            }

            // Fetch fresh
            try {
                const stats = await fetcher(cleanUsername);
                results[platform] = {
                    username: cleanUsername,
                    stats,
                    fetchedAt: new Date(),
                    cached: false,
                };
                // Update cache
                const cacheUpdate = {};
                cacheUpdate[`platformStatsCache.${platform}.stats`] = stats;
                cacheUpdate[`platformStatsCache.${platform}.fetchedAt`] = new Date();
                await User.findByIdAndUpdate(req.user._id, { $set: cacheUpdate });
            } catch (err) {
                // Use stale cache if available
                const stale = user.platformStatsCache?.[platform];
                if (stale?.stats) {
                    results[platform] = {
                        username: cleanUsername,
                        stats: stale.stats,
                        fetchedAt: stale.fetchedAt,
                        cached: true,
                        stale: true,
                    };
                } else {
                    results[platform] = {
                        username: cleanUsername,
                        error: err.message,
                    };
                }
            }
        });

        await Promise.allSettled(promises);
        res.json(results);
    } catch (err) {
        console.error('Platform stats all error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
