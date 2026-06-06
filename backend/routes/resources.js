const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const Community = require('../models/Community');
const { protect } = require('../middleware/auth');
const { upload, resourceUpload } = require('../middleware/upload');
const { createNotification } = require('../utils/notify');

// Helper: escape special regex characters to prevent ReDoS
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// GET all resources
router.get('/', async (req, res) => {
    try {
        const { search, type, communityId, isPublic } = req.query;
        let query = {};
        if (search) query.title = { $regex: escapeRegex(search), $options: 'i' };
        if (type) query.type = type;
        if (communityId) query.communityId = communityId;
        if (isPublic === 'true') query.isPublic = true;
        const resources = await Resource.find(query)
            .populate('uploadedBy', 'username fullName profileImage')
            .populate('communityId', 'name')
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET user's resources (MUST be above /:id)
router.get('/my', protect, async (req, res) => {
    try {
        const resources = await Resource.find({ uploadedBy: req.user._id })
            .populate('communityId', 'name')
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/user/me', protect, async (req, res) => {
    try {
        const resources = await Resource.find({ uploadedBy: req.user._id })
            .populate('communityId', 'name')
            .sort({ createdAt: -1 });
        res.json(resources);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single resource
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'username fullName profileImage')
            .populate('communityId', 'name')
            .populate('projectId', 'name');
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json(resource);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create resource (with optional file uploads)
router.post('/', protect, resourceUpload, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'files', maxCount: 10 }]), async (req, res) => {
    try {
        const { title, description, type, url, communityId, projectId, isPublic, tags } = req.body;
        if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });

        const resourceData = {
            title, description,
            type: type || 'document',
            url: url || '',
            communityId: communityId || null,
            projectId: projectId || null,
            isPublic: isPublic !== 'false',
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags) : [],
            uploadedBy: req.user._id
        };

        if (req.files?.file?.[0]) {
            const f = req.files.file[0];
            resourceData.filePath = f.path; // Cloudinary URL
            resourceData.fileName = f.originalname;
            resourceData.fileSize = f.size;
        }

        // Handle additional files
        if (req.files?.files && req.files.files.length > 0) {
            resourceData.files = req.files.files.map(f => ({
                fileName: f.originalname,
                filePath: f.path, // Cloudinary URL
                fileSize: f.size
            }));
        }

        const resource = await Resource.create(resourceData);

        // Notify community admin if resource is shared in a community
        if (resource.communityId) {
            try {
                const community = await Community.findById(resource.communityId);
                if (community && community.adminId.toString() !== req.user._id.toString()) {
                    createNotification({
                        userId: community.adminId,
                        type: 'resource_shared',
                        title: 'New Resource Shared',
                        message: `${req.user.fullName || req.user.username} shared "${resource.title}" in ${community.name}`,
                        link: `/resources/${resource._id}`,
                        meta: { resourceId: resource._id, communityId: community._id },
                    });
                }
            } catch { /* silent */ }
        }

        res.status(201).json(resource);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update resource
router.put('/:id', protect, resourceUpload, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'files', maxCount: 10 }]), async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        if (resource.uploadedBy.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        const allowedFields = ['title', 'description', 'type', 'url', 'communityId', 'projectId', 'isPublic', 'tags'];
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) updateData[field] = req.body[field];
        });
        if (req.files?.file?.[0]) {
            const f = req.files.file[0];
            updateData.filePath = f.path; // Cloudinary URL
            updateData.fileName = f.originalname;
            updateData.fileSize = f.size;
        }
        // Handle additional files
        if (req.files?.files && req.files.files.length > 0) {
            const newFiles = req.files.files.map(f => ({
                fileName: f.originalname,
                filePath: f.path, // Cloudinary URL
                fileSize: f.size
            }));
            const resource2 = await Resource.findById(req.params.id);
            updateData.files = [...(resource2.files || []), ...newFiles];
        }
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        const updated = await Resource.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE resource
router.delete('/:id', protect, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.userType !== 'system_admin')
            return res.status(403).json({ message: 'Not authorized' });
        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resource removed' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST download (increment count)
router.post('/:id/download', async (req, res) => {
    try {
        await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
        res.json({ message: 'Download counted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
// POST upload additional files to a resource
router.post('/:id/files', protect, resourceUpload, upload.array('files', 10), async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        if (resource.uploadedBy.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const newFiles = req.files.map(f => ({
            fileName: f.originalname,
            filePath: f.path, // Cloudinary URL
            fileSize: f.size
        }));

        resource.files = [...(resource.files || []), ...newFiles];
        await resource.save();

        res.status(201).json({ message: `${newFiles.length} file(s) uploaded`, files: resource.files });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE a file from a resource
router.delete('/:id/files/:fileIndex', protect, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        if (resource.uploadedBy.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });

        const idx = parseInt(req.params.fileIndex);
        if (isNaN(idx) || idx < 0 || idx >= (resource.files || []).length) {
            return res.status(400).json({ message: 'Invalid file index' });
        }

        resource.files.splice(idx, 1);
        await resource.save();

        res.json({ message: 'File removed', files: resource.files });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
