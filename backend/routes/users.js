const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload, profileUpload } = require('../middleware/upload');

// GET user profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('communityId', 'name');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { fullName, location, bio, profileImage, socialLinks } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { fullName, location, bio, profileImage, socialLinks },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST upload profile picture
router.post('/profile/picture', protect, profileUpload, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image file provided' });
        // req.file.path is the permanent Cloudinary URL
        const profileImage = req.file.path;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profileImage },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update password
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        if (!(await user.matchPassword(currentPassword)))
            return res.status(400).json({ message: 'Current password is incorrect' });
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update notification settings
router.put('/settings', protect, async (req, res) => {
    try {
        const { emailNotifications, projectUpdates, communityUpdates } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { emailNotifications, projectUpdates, communityUpdates },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
