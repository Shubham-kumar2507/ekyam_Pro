const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const JoinRequest = require('../models/JoinRequest');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload, projectUpload, projectFileUpload } = require('../middleware/upload');
const { createNotification, buildJoinRequestEmail } = require('../utils/notify');

// Helper: escape special regex characters to prevent ReDoS
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// GET all projects
router.get('/', async (req, res) => {
    try {
        const { search, status, communityId } = req.query;
        let query = {};
        if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };
        if (status) query.status = status;
        if (communityId) query.communityId = communityId;
        const projects = await Project.find(query)
            .populate('createdBy', 'username fullName profileImage')
            .populate('communityId', 'name')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET featured projects (MUST be above /:id)
router.get('/featured', async (req, res) => {
    try {
        const projects = await Project.find({ isFeatured: true })
            .populate('createdBy', 'username fullName')
            .populate('communityId', 'name')
            .limit(3);
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET user's projects (MUST be above /:id)
router.get('/my', protect, async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [{ createdBy: req.user._id }, { 'members.userId': req.user._id }]
        }).populate('communityId', 'name').sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/user/me', protect, async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [{ createdBy: req.user._id }, { 'members.userId': req.user._id }]
        }).populate('communityId', 'name').sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'username fullName profileImage')
            .populate('communityId', 'name')
            .populate('members.userId', 'username fullName profileImage');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create project (with optional image upload)
router.post('/', protect, projectUpload, upload.single('image'), async (req, res) => {
    try {
        const { name, description, status, startDate, endDate, communityId } = req.body;
        if (!name || !description) return res.status(400).json({ message: 'Name and description are required' });

        const projectData = {
            name, description,
            status: status || 'planning',
            startDate: startDate || null,
            endDate: endDate || null,
            communityId: communityId || null,
            createdBy: req.user._id,
            members: [{ userId: req.user._id, role: 'creator' }],
            memberCount: 1
        };
        if (req.file) projectData.image = req.file.path; // Cloudinary URL

        const project = await Project.create(projectData);
        res.status(201).json(project);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update project
router.put('/:id', protect, projectUpload, upload.single('image'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.createdBy.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        const allowedFields = ['name', 'description', 'status', 'startDate', 'endDate', 'communityId', 'isFeatured'];
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) updateData[field] = req.body[field];
        });
        if (req.file) updateData.image = req.file.path; // Cloudinary URL

        const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE project
router.delete('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.createdBy.toString() !== req.user._id.toString() && req.user.userType !== 'system_admin')
            return res.status(403).json({ message: 'Not authorized' });
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST request to join project (with reason)
router.post('/:id/join', protect, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || !reason.trim()) return res.status(400).json({ message: 'Please provide a reason for joining' });

        const project = await Project.findById(req.params.id).populate('createdBy', 'username fullName email');
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Check if already a member
        const alreadyMember = project.members.find(m => m.userId.toString() === req.user._id.toString());
        if (alreadyMember) return res.status(400).json({ message: 'Already a member' });

        // Check if already has a pending request
        const existingRequest = await JoinRequest.findOne({
            type: 'project', targetId: req.params.id, userId: req.user._id, status: 'pending'
        });
        if (existingRequest) return res.status(400).json({ message: 'You already have a pending request' });

        await JoinRequest.create({
            type: 'project', targetId: req.params.id, userId: req.user._id, reason: reason.trim()
        });

        // Notify the project creator (in-app + email)
        const creator = project.createdBy;
        if (creator && creator._id.toString() !== req.user._id.toString()) {
            const emailHtml = buildJoinRequestEmail({
                recipientName: creator.fullName || creator.username,
                requesterName: req.user.fullName || req.user.username,
                requesterEmail: req.user.email,
                reason: reason.trim(),
                targetName: project.name,
                targetType: 'project',
                targetLink: `/projects/${project._id}`,
            });

            createNotification({
                userId: creator._id,
                type: 'join_request_project',
                title: 'New Project Join Request',
                message: `${req.user.fullName || req.user.username} wants to join "${project.name}"`,
                link: `/projects/${project._id}`,
                meta: { requesterId: req.user._id, projectId: project._id, reason: reason.trim() },
                email: {
                    to: creator.email,
                    subject: `📋 New join request for "${project.name}"`,
                    html: emailHtml,
                },
            });
        }

        res.status(201).json({ message: 'Join request sent successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET check if current user has a pending request for this project
router.get('/:id/my-request', protect, async (req, res) => {
    try {
        const request = await JoinRequest.findOne({
            type: 'project', targetId: req.params.id, userId: req.user._id
        }).sort({ createdAt: -1 });
        res.json({ request: request || null });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET pending join requests for a project (creator only)
router.get('/:id/join-requests', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.createdBy.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Only the project creator can view requests' });

        const requests = await JoinRequest.find({
            type: 'project', targetId: req.params.id, status: 'pending'
        }).populate('userId', 'username fullName profileImage email').sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT approve a join request (creator only)
router.put('/:id/join-requests/:requestId/approve', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.createdBy.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        const joinReq = await JoinRequest.findById(req.params.requestId);
        if (!joinReq || joinReq.status !== 'pending')
            return res.status(404).json({ message: 'Request not found or already processed' });

        // Approve: update request status
        joinReq.status = 'approved';
        joinReq.reviewedBy = req.user._id;
        joinReq.reviewedAt = new Date();
        await joinReq.save();

        // Add user to project members
        const alreadyMember = project.members.find(m => m.userId.toString() === joinReq.userId.toString());
        if (!alreadyMember) {
            project.members.push({ userId: joinReq.userId, role: 'member' });
            project.memberCount = project.members.length;
            await project.save();
        }

        res.json({ message: 'Request approved' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT reject a join request (creator only)
router.put('/:id/join-requests/:requestId/reject', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.createdBy.toString() !== req.user._id.toString())
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
// POST upload files to a project
router.post('/:id/files', protect, projectFileUpload, upload.array('files', 10), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isMember = project.members.some(m => m.userId.toString() === req.user._id.toString());
        if (!isMember) return res.status(403).json({ message: 'Only project members can upload files' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const newFiles = req.files.map(f => ({
            fileName: f.originalname,
            filePath: f.path, // Cloudinary URL
            fileSize: f.size
        }));

        project.files = [...(project.files || []), ...newFiles];
        await project.save();

        res.status(201).json({ message: `${newFiles.length} file(s) uploaded`, files: project.files });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE a file from a project
router.delete('/:id/files/:fileIndex', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.createdBy.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        const idx = parseInt(req.params.fileIndex);
        if (isNaN(idx) || idx < 0 || idx >= (project.files || []).length) {
            return res.status(400).json({ message: 'Invalid file index' });
        }

        project.files.splice(idx, 1);
        await project.save();

        res.json({ message: 'File removed', files: project.files });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
