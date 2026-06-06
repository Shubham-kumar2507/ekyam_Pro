const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');
const JoinRequest = require('../models/JoinRequest');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload, communityUpload } = require('../middleware/upload');
const { createNotification, buildJoinRequestEmail } = require('../utils/notify');

// Helper: escape special regex characters to prevent ReDoS
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET all communities
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };
        if (category) query.category = category;
        const communities = await Community.find(query).populate('adminId', 'username fullName').sort({ createdAt: -1 });
        res.json(communities);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET communities the current user joined (MUST be above /:id to avoid route conflict)
router.get('/user/joined', protect, async (req, res) => {
    try {
        const memberships = await CommunityMember.find({ userId: req.user._id }).populate('communityId');
        res.json(memberships.map(m => m.communityId).filter(Boolean));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET communities for current user (member + admin) — used by Dashboard
router.get('/user/me', protect, async (req, res) => {
    try {
        // Get communities the user is a member of
        const memberships = await CommunityMember.find({ userId: req.user._id }).populate('communityId');
        const memberCommunities = memberships.map(m => m.communityId).filter(Boolean);
        // Also get communities where user is admin (in case CommunityMember record is missing for older data)
        const adminCommunities = await Community.find({ adminId: req.user._id });
        // Merge and deduplicate by _id
        const seen = new Set();
        const all = [];
        [...memberCommunities, ...adminCommunities].forEach(c => {
            const id = c._id.toString();
            if (!seen.has(id)) { seen.add(id); all.push(c); }
        });
        res.json(all);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single community
router.get('/:id', async (req, res) => {
    try {
        const community = await Community.findById(req.params.id).populate('adminId', 'username fullName');
        if (!community) return res.status(404).json({ message: 'Community not found' });
        const members = await CommunityMember.find({ communityId: req.params.id }).populate('userId', 'username fullName location profileImage');
        res.json({ ...community.toObject(), members });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create community (with optional logo upload)
router.post('/', protect, communityUpload, upload.single('image'), async (req, res) => {
    try {
        const { name, description, location, category, coordinates } = req.body;
        const image = req.file ? req.file.path : (req.body.image || ''); // Cloudinary URL
        const parsedCoords = coordinates ? (typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates) : {};
        const community = await Community.create({ name, description, location, category, image, adminId: req.user._id, coordinates: parsedCoords });
        // Add creator as a CommunityMember with admin role
        await CommunityMember.create({ communityId: community._id, userId: req.user._id, role: 'admin' });
        await User.findByIdAndUpdate(req.user._id, { userType: 'community_admin', communityId: community._id });
        res.status(201).json(community);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update community (with optional logo upload)
router.put('/:id', protect, communityUpload, upload.single('image'), async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        const updateData = { ...req.body };
        // Parse coordinates if sent as string
        if (updateData.coordinates && typeof updateData.coordinates === 'string') {
            updateData.coordinates = JSON.parse(updateData.coordinates);
        }
        if (req.file) {
            updateData.image = req.file.path; // Cloudinary URL
        }
        const updated = await Community.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE community
router.delete('/:id', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString() && req.user.userType !== 'system_admin')
            return res.status(403).json({ message: 'Not authorized' });
        await Community.findByIdAndDelete(req.params.id);
        res.json({ message: 'Community removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST request to join community (with reason)
router.post('/:id/join', protect, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || !reason.trim()) return res.status(400).json({ message: 'Please provide a reason for joining' });

        const community = await Community.findById(req.params.id).populate('adminId', 'username fullName email');
        if (!community) return res.status(404).json({ message: 'Community not found' });

        // Check if already a member
        const existing = await CommunityMember.findOne({ communityId: req.params.id, userId: req.user._id });
        if (existing) return res.status(400).json({ message: 'Already a member' });

        // Check if admin
        if (community.adminId._id.toString() === req.user._id.toString())
            return res.status(400).json({ message: 'You are the admin of this community' });

        // Check if already has a pending request
        const existingRequest = await JoinRequest.findOne({
            type: 'community', targetId: req.params.id, userId: req.user._id, status: 'pending'
        });
        if (existingRequest) return res.status(400).json({ message: 'You already have a pending request' });

        await JoinRequest.create({
            type: 'community', targetId: req.params.id, userId: req.user._id, reason: reason.trim()
        });

        // Notify the community admin (in-app + email)
        const admin = community.adminId;
        if (admin && admin._id.toString() !== req.user._id.toString()) {
            const emailHtml = buildJoinRequestEmail({
                recipientName: admin.fullName || admin.username,
                requesterName: req.user.fullName || req.user.username,
                requesterEmail: req.user.email,
                reason: reason.trim(),
                targetName: community.name,
                targetType: 'community',
                targetLink: `/communities/${community._id}`,
            });

            createNotification({
                userId: admin._id,
                type: 'join_request_community',
                title: 'New Community Join Request',
                message: `${req.user.fullName || req.user.username} wants to join "${community.name}"`,
                link: `/communities/${community._id}`,
                meta: { requesterId: req.user._id, communityId: community._id, reason: reason.trim() },
                email: {
                    to: admin.email,
                    subject: `👥 New join request for "${community.name}"`,
                    html: emailHtml,
                },
            });
        }

        res.status(201).json({ message: 'Join request sent successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET check if current user has a request for this community
router.get('/:id/my-request', protect, async (req, res) => {
    try {
        const request = await JoinRequest.findOne({
            type: 'community', targetId: req.params.id, userId: req.user._id
        }).sort({ createdAt: -1 });
        res.json({ request: request || null });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET pending join requests for a community (admin only)
router.get('/:id/join-requests', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Only the admin can view requests' });

        const requests = await JoinRequest.find({
            type: 'community', targetId: req.params.id, status: 'pending'
        }).populate('userId', 'username fullName profileImage email').sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT approve a join request (admin only)
router.put('/:id/join-requests/:requestId/approve', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        const joinReq = await JoinRequest.findById(req.params.requestId);
        if (!joinReq || joinReq.status !== 'pending')
            return res.status(404).json({ message: 'Request not found or already processed' });

        // Approve: update request status
        joinReq.status = 'approved';
        joinReq.reviewedBy = req.user._id;
        joinReq.reviewedAt = new Date();
        await joinReq.save();

        // Add user as community member
        const existing = await CommunityMember.findOne({ communityId: req.params.id, userId: joinReq.userId });
        if (!existing) {
            await CommunityMember.create({ communityId: req.params.id, userId: joinReq.userId });
            const count = await CommunityMember.countDocuments({ communityId: req.params.id });
            await Community.findByIdAndUpdate(req.params.id, { memberCount: count + 1 });
        }

        res.json({ message: 'Request approved' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT reject a join request (admin only)
router.put('/:id/join-requests/:requestId/reject', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        const joinReq = await JoinRequest.findById(req.params.requestId);
        if (!joinReq || joinReq.status !== 'pending')
            return res.status(404).json({ message: 'Request not found or already processed' });

        joinReq.status = 'rejected';
        joinReq.reviewedBy = req.user._id;
        joinReq.reviewedAt = new Date();
        await joinReq.save();

        res.json({ message: 'Request rejected' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST leave community
router.post('/:id/leave', protect, async (req, res) => {
    try {
        await CommunityMember.findOneAndDelete({ communityId: req.params.id, userId: req.user._id });
        const count = await CommunityMember.countDocuments({ communityId: req.params.id });
        await Community.findByIdAndUpdate(req.params.id, { memberCount: count });
        res.json({ message: 'Left community' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET members of a community
router.get('/:id/members', async (req, res) => {
    try {
        const members = await CommunityMember.find({ communityId: req.params.id }).populate('userId', 'username fullName location profileImage');
        res.json(members);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// (Route moved above /:id for correct ordering)

// PUT update member role (admin only)
router.put('/:id/members/:userId/role', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Only admin can update roles' });

        const member = await CommunityMember.findOneAndUpdate(
            { communityId: req.params.id, userId: req.params.userId },
            { role: req.body.role },
            { new: true }
        ).populate('userId', 'username fullName profileImage');
        if (!member) return res.status(404).json({ message: 'Member not found' });
        res.json(member);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE remove member (admin only)
router.delete('/:id/members/:userId', protect, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });
        if (community.adminId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Only admin can remove members' });

        await CommunityMember.findOneAndDelete({ communityId: req.params.id, userId: req.params.userId });
        const count = await CommunityMember.countDocuments({ communityId: req.params.id });
        await Community.findByIdAndUpdate(req.params.id, { memberCount: count });
        res.json({ message: 'Member removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET community stats
router.get('/:id/stats', async (req, res) => {
    try {
        const Project = require('../models/Project');
        const Resource = require('../models/Resource');
        const CommunityActivity = require('../models/CommunityActivity');

        const members = await CommunityMember.countDocuments({ communityId: req.params.id });
        const projects = await Project.countDocuments({ communityId: req.params.id });
        const resources = await Resource.countDocuments({ communityId: req.params.id });

        // Active members = distinct users with activity in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeResult = await CommunityActivity.distinct('userId', {
            communityId: req.params.id,
            activityDate: { $gte: thirtyDaysAgo }
        });

        res.json({
            members: members + 1, // +1 for admin
            projects,
            resources,
            active_members: activeResult.length
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET recent activity for community
router.get('/:id/activity', async (req, res) => {
    try {
        const CommunityActivity = require('../models/CommunityActivity');
        const activities = await CommunityActivity.find({ communityId: req.params.id })
            .sort({ activityDate: -1 })
            .limit(10)
            .populate('userId', 'username fullName');
        res.json(activities);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
