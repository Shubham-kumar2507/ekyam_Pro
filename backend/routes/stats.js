const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Community = require('../models/Community');
const Project = require('../models/Project');
const Resource = require('../models/Resource');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const CommunityActivity = require('../models/CommunityActivity');

// GET platform stats
router.get('/', async (req, res) => {
    try {
        const [communities, projects, resources, members] = await Promise.all([
            Community.countDocuments(),
            Project.countDocuments(),
            Resource.countDocuments(),
            User.countDocuments()
        ]);
        res.json({ communities, projects, resources, members });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET community contribution leaderboard — top contributors across all community work
router.get('/leaderboard/community', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 25);

        // Aggregate contributions from multiple sources in parallel
        const [postCounts, commentCounts, resourceCounts, projectCounts, activityCounts] = await Promise.all([
            // Posts authored
            Post.aggregate([
                { $group: { _id: '$author', count: { $sum: 1 } } }
            ]),
            // Comments authored
            Comment.aggregate([
                { $group: { _id: '$author', count: { $sum: 1 } } }
            ]),
            // Resources uploaded
            Resource.aggregate([
                { $group: { _id: '$uploadedBy', count: { $sum: 1 } } }
            ]),
            // Projects created
            Project.aggregate([
                { $group: { _id: '$createdBy', count: { $sum: 1 } } }
            ]),
            // Community activities
            CommunityActivity.aggregate([
                { $group: { _id: '$userId', count: { $sum: 1 } } }
            ]),
        ]);

        // Merge all contributions into a single map
        const scoreMap = {};

        const addScores = (arr, weight, category) => {
            arr.forEach(({ _id, count }) => {
                if (!_id) return;
                const key = _id.toString();
                if (!scoreMap[key]) scoreMap[key] = { total: 0, breakdown: {} };
                scoreMap[key].total += count * weight;
                scoreMap[key].breakdown[category] = count;
            });
        };

        addScores(postCounts, 3, 'posts');          // Posts weigh 3
        addScores(commentCounts, 1, 'comments');     // Comments weigh 1
        addScores(resourceCounts, 4, 'resources');   // Resources weigh 4
        addScores(projectCounts, 5, 'projects');     // Projects weigh 5
        addScores(activityCounts, 2, 'activities');  // Activities weigh 2

        // Sort by total score, take top N
        const sorted = Object.entries(scoreMap)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, limit);

        if (sorted.length === 0) return res.json([]);

        // Fetch user details for top contributors
        const userIds = sorted.map(([id]) => id);
        const users = await User.find(
            { _id: { $in: userIds } },
            'username fullName profileImage bio location'
        ).lean();

        const userMap = {};
        users.forEach(u => { userMap[u._id.toString()] = u; });

        const leaderboard = sorted.map(([id, data], index) => {
            const user = userMap[id] || {};
            return {
                rank: index + 1,
                userId: id,
                username: user.username || 'Unknown',
                fullName: user.fullName || 'Unknown User',
                profileImage: user.profileImage || '',
                bio: user.bio || '',
                location: user.location || '',
                score: data.total,
                breakdown: {
                    posts: data.breakdown.posts || 0,
                    comments: data.breakdown.comments || 0,
                    resources: data.breakdown.resources || 0,
                    projects: data.breakdown.projects || 0,
                    activities: data.breakdown.activities || 0,
                },
            };
        });

        res.json(leaderboard);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET project leaderboard — projects ranked by number of updates
router.get('/leaderboard/projects', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 25);

        // Get all projects with basic info
        const projects = await Project.find({})
            .populate('createdBy', 'username fullName profileImage')
            .populate('communityId', 'name')
            .populate('members.userId', 'username fullName profileImage')
            .lean();

        // Count posts and resources per project in parallel
        const [postCounts, resourceCounts] = await Promise.all([
            Post.aggregate([
                { $match: { project: { $ne: null } } },
                { $group: { _id: '$project', count: { $sum: 1 } } }
            ]),
            Resource.aggregate([
                { $match: { projectId: { $ne: null } } },
                { $group: { _id: '$projectId', count: { $sum: 1 } } }
            ]),
        ]);

        const postMap = {};
        postCounts.forEach(({ _id, count }) => { if (_id) postMap[_id.toString()] = count; });
        const resourceMap = {};
        resourceCounts.forEach(({ _id, count }) => { if (_id) resourceMap[_id.toString()] = count; });

        // Calculate total updates for each project
        const ranked = projects.map(p => {
            const id = p._id.toString();
            const posts = postMap[id] || 0;
            const resources = resourceMap[id] || 0;
            const files = (p.files || []).length;
            const totalUpdates = posts + resources + files;

            return {
                projectId: id,
                name: p.name,
                description: p.description,
                image: p.image || '',
                status: p.status,
                communityName: p.communityId?.name || null,
                creator: p.createdBy ? {
                    username: p.createdBy.username,
                    fullName: p.createdBy.fullName,
                    profileImage: p.createdBy.profileImage || '',
                } : null,
                members: (p.members || []).slice(0, 5).map(m => ({
                    username: m.userId?.username || '',
                    fullName: m.userId?.fullName || '',
                    profileImage: m.userId?.profileImage || '',
                })),
                memberCount: p.memberCount || (p.members || []).length,
                totalUpdates,
                breakdown: { posts, resources, files },
                updatedAt: p.updatedAt,
            };
        });

        // Sort by totalUpdates descending, then by memberCount, then by updatedAt
        ranked.sort((a, b) => {
            if (b.totalUpdates !== a.totalUpdates) return b.totalUpdates - a.totalUpdates;
            if (b.memberCount !== a.memberCount) return b.memberCount - a.memberCount;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        res.json(ranked.slice(0, limit));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
