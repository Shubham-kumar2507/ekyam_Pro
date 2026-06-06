const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET all notifications for the logged-in user (paginated)
router.get('/', protect, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ userId: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({ userId: req.user._id }),
            Notification.countDocuments({ userId: req.user._id, read: false }),
        ]);

        res.json({ notifications, total, unreadCount, page, pages: Math.ceil(total / limit) });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET unread count only (lightweight endpoint for the bell badge)
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user._id, read: false });
        res.json({ count });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT mark ALL notifications as read (MUST be above /:id/read)
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT mark a single notification as read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE a single notification
router.delete('/:id', protect, async (req, res) => {
    try {
        const result = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!result) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE all notifications for current user
router.delete('/', protect, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user._id });
        res.json({ message: 'All notifications cleared' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
