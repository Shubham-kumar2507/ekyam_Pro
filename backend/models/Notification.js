const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        enum: [
            'join_request_community',   // someone wants to join your community
            'join_request_project',     // someone wants to join your project
            'join_approved',            // your join request was approved
            'join_rejected',            // your join request was rejected
            'resource_shared',          // a new resource was shared in your community
            'community_update',         // community info updated
            'connection_request',       // someone sent you a connect request
            'connection_accepted',      // your connect request was accepted
            'new_follower',             // someone followed you
            'post_created',             // new post in feed
            'project_update',           // project you're in was updated
            'general',                  // generic notification
        ],
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },           // frontend route to navigate to
    read: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed },   // extra data (sender info, IDs, etc.)
}, { timestamps: true });

// TTL index: auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
