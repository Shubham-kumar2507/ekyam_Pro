const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { createNotification } = require('../utils/notify');

// POST follow a user (instant – no approval needed)
router.post('/follow/:userId', protect, async (req, res) => {
    try {
        if (req.params.userId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }

        const target = await User.findById(req.params.userId);
        if (!target) return res.status(404).json({ message: 'User not found' });

        const existing = await Connection.findOne({
            follower: req.user._id,
            following: req.params.userId
        });
        if (existing) return res.status(400).json({ message: 'Already following or connection exists' });

        await Connection.create({
            follower: req.user._id,
            following: req.params.userId,
            type: 'follow',
            status: 'accepted'
        });

        // Notify the target user
        createNotification({
            userId: req.params.userId,
            type: 'new_follower',
            title: 'New Follower',
            message: `${req.user.fullName || req.user.username} started following you`,
            link: `/users/${req.user._id}`,
            meta: { followerId: req.user._id },
        });

        res.status(201).json({ message: 'Followed successfully' });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Already following' });
        res.status(500).json({ message: err.message });
    }
});

// DELETE unfollow a user
router.delete('/unfollow/:userId', protect, async (req, res) => {
    try {
        const result = await Connection.findOneAndDelete({
            follower: req.user._id,
            following: req.params.userId
        });
        if (!result) return res.status(404).json({ message: 'Connection not found' });
        res.json({ message: 'Unfollowed successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST send connect request (requires approval)
router.post('/connect/:userId', protect, async (req, res) => {
    try {
        if (req.params.userId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot connect with yourself' });
        }

        const target = await User.findById(req.params.userId);
        if (!target) return res.status(404).json({ message: 'User not found' });

        // Check if a connect-type connection already exists (in either direction)
        const existingConnect = await Connection.findOne({
            type: 'connect',
            $or: [
                { follower: req.user._id, following: req.params.userId },
                { follower: req.params.userId, following: req.user._id }
            ]
        });
        if (existingConnect) return res.status(400).json({ message: 'Connect request already exists' });

        // Check if a follow-type connection exists from me -> them (upgrade it)
        const existingFollow = await Connection.findOne({
            follower: req.user._id,
            following: req.params.userId,
            type: 'follow'
        });

        if (existingFollow) {
            // Upgrade existing follow to a pending connect request
            existingFollow.type = 'connect';
            existingFollow.status = 'pending';
            await existingFollow.save();

            // Notify the target user
            createNotification({
                userId: req.params.userId,
                type: 'connection_request',
                title: 'Connection Request',
                message: `${req.user.fullName || req.user.username} sent you a connection request`,
                link: `/network`,
                meta: { requesterId: req.user._id },
            });

            return res.status(200).json({ message: 'Connect request sent (upgraded from follow)' });
        }

        await Connection.create({
            follower: req.user._id,
            following: req.params.userId,
            type: 'connect',
            status: 'pending'
        });

        // Notify the target user
        createNotification({
            userId: req.params.userId,
            type: 'connection_request',
            title: 'Connection Request',
            message: `${req.user.fullName || req.user.username} sent you a connection request`,
            link: `/network`,
            meta: { requesterId: req.user._id },
        });

        res.status(201).json({ message: 'Connect request sent' });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Connection already exists' });
        res.status(500).json({ message: err.message });
    }
});

// PUT respond to connect request (accept / reject)
router.put('/respond/:connectionId', protect, async (req, res) => {
    try {
        const { action } = req.body; // 'accept' or 'reject'
        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Action must be accept or reject' });
        }

        const connection = await Connection.findById(req.params.connectionId);
        if (!connection) return res.status(404).json({ message: 'Connection not found' });

        // Only the person being followed/connected can respond
        if (connection.following.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to respond to this request' });
        }

        if (action === 'accept') {
            connection.status = 'accepted';
            await connection.save();

            // Create the reverse connection so both are connected
            const reverse = await Connection.findOne({
                follower: req.user._id,
                following: connection.follower
            });
            if (!reverse) {
                await Connection.create({
                    follower: req.user._id,
                    following: connection.follower,
                    type: 'connect',
                    status: 'accepted'
                });
            }

            res.json({ message: 'Connection accepted' });

            // Notify the requester that their request was accepted
            createNotification({
                userId: connection.follower,
                type: 'connection_accepted',
                title: 'Connection Accepted',
                message: `${req.user.fullName || req.user.username} accepted your connection request`,
                link: `/users/${req.user._id}`,
                meta: { accepterId: req.user._id },
            });
        } else {
            connection.status = 'rejected';
            await connection.save();
            res.json({ message: 'Connection rejected' });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET search users (MUST be above parametric routes)
router.get('/search', protect, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const users = await User.find({
            _id: { $ne: req.user._id },
            $or: [
                { username: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
                { fullName: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
            ]
        }).select('username fullName profileImage bio').limit(20);

        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET pending connect requests for current user (MUST be above parametric routes)
router.get('/requests', protect, async (req, res) => {
    try {
        const requests = await Connection.find({
            following: req.user._id,
            type: 'connect',
            status: 'pending'
        }).populate('follower', 'username fullName profileImage bio');

        res.json(requests);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET followers of a user
router.get('/followers/:userId', async (req, res) => {
    try {
        const connections = await Connection.find({
            following: req.params.userId,
            status: 'accepted'
        }).populate('follower', 'username fullName profileImage bio');

        const followers = connections.map(c => c.follower);
        res.json(followers);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET who a user is following
router.get('/following/:userId', async (req, res) => {
    try {
        const connections = await Connection.find({
            follower: req.params.userId,
            status: 'accepted'
        }).populate('following', 'username fullName profileImage bio');

        const following = connections.map(c => c.following);
        res.json(following);
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// GET relationship status with a specific user
router.get('/status/:userId', protect, async (req, res) => {
    try {
        const outgoing = await Connection.findOne({
            follower: req.user._id,
            following: req.params.userId
        });

        const incoming = await Connection.findOne({
            follower: req.params.userId,
            following: req.user._id
        });

        // Count followers and following
        const followerCount = await Connection.countDocuments({
            following: req.params.userId,
            status: 'accepted'
        });
        const followingCount = await Connection.countDocuments({
            follower: req.params.userId,
            status: 'accepted'
        });

        let status = 'none';
        if (outgoing) {
            if (outgoing.status === 'pending') status = 'pending';
            else if (outgoing.status === 'accepted') status = outgoing.type === 'connect' ? 'connected' : 'following';
        }

        // Check if the other user has sent us a pending request
        let incomingPending = false;
        if (incoming && incoming.status === 'pending') {
            incomingPending = true;
        }

        res.json({ status, incomingPending, followerCount, followingCount });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET a public user profile
router.get('/user/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const followerCount = await Connection.countDocuments({
            following: req.params.userId,
            status: 'accepted'
        });
        const followingCount = await Connection.countDocuments({
            follower: req.params.userId,
            status: 'accepted'
        });

        res.json({ ...user.toObject(), followerCount, followingCount });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// (Routes moved above parametric routes for correct ordering)

module.exports = router;
