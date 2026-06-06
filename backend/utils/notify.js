/**
 * Helper to create in-app notifications and optionally send an email.
 * Used by join routes, connection routes, resource routes, etc.
 */
const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Create an in-app notification and optionally email the recipient.
 * @param {Object} opts
 * @param {string}  opts.userId       - recipient user _id
 * @param {string}  opts.type         - notification type enum value
 * @param {string}  opts.title        - short title
 * @param {string}  opts.message      - description
 * @param {string}  [opts.link]       - frontend route (e.g. "/projects/abc")
 * @param {Object}  [opts.meta]       - extra data
 * @param {Object}  [opts.email]      - if provided, sends an email { to, subject, html }
 */
async function createNotification({ userId, type, title, message, link = '', meta = {}, email = null }) {
    try {
        const notif = await Notification.create({ userId, type, title, message, link, meta });
        console.log(`🔔 Notification created: [${type}] "${title}" → user ${userId}`);
    } catch (err) {
        console.error('❌ Failed to create notification:', err.message, JSON.stringify({ userId, type, title }));
        if (err.errors) {
            Object.keys(err.errors).forEach(field => {
                console.error(`   Validation error on "${field}":`, err.errors[field].message);
            });
        }
    }

    // Send email in background (don't block the response)
    if (email) {
        sendEmail(email).catch(err => {
            console.error(`Failed to send notification email to ${email.to}:`, err.message);
        });
    }
}

/**
 * Build a styled EKYAM email body.
 */
function buildJoinRequestEmail({ recipientName, requesterName, requesterEmail, reason, targetName, targetType, targetLink }) {
    const fullLink = `${FRONTEND_URL}${targetLink}`;
    return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background: linear-gradient(135deg, #4338ca, #6366f1); padding: 2rem; text-align: center; color: #fff;">
                <h1 style="margin: 0; font-size: 1.5rem;">EKYAM</h1>
                <p style="opacity: 0.85; margin-top: 0.25rem;">New Join Request</p>
            </div>
            <div style="padding: 2rem;">
                <p style="color: #374151;">Hi <strong>${recipientName}</strong>,</p>
                <p style="color: #6b7280;">Someone has requested to join your <strong>${targetType}</strong> — <strong>${targetName}</strong>.</p>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.25rem; margin: 1.25rem 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="color: #9ca3af; font-size: 0.8rem; padding: 0.25rem 0;">Name</td><td style="color: #374151; font-weight: 600; padding: 0.25rem 0;">${requesterName}</td></tr>
                        <tr><td style="color: #9ca3af; font-size: 0.8rem; padding: 0.25rem 0;">Email</td><td style="color: #374151; padding: 0.25rem 0;">${requesterEmail}</td></tr>
                        <tr><td style="color: #9ca3af; font-size: 0.8rem; padding: 0.25rem 0;">Reason</td><td style="color: #374151; padding: 0.25rem 0;">${reason}</td></tr>
                    </table>
                </div>
                <div style="text-align: center; margin: 1.5rem 0;">
                    <a href="${fullLink}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        Review Request
                    </a>
                </div>
                <p style="color: #9ca3af; font-size: 0.85rem;">You can approve or reject this request from the ${targetType} details page.</p>
            </div>
        </div>
    `;
}

module.exports = { createNotification, buildJoinRequestEmail, FRONTEND_URL };
