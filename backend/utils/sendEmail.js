/**
 * Shared email utility — extracted from auth.js so multiple routes can send emails.
 * Uses Gmail REST API (OAuth2) to avoid SMTP port blocks on Render / Railway.
 */
const { google } = require('googleapis');

const EMAIL_FROM_ADDR = process.env.EMAIL_USER || 'ekyampro@gmail.com';
const EMAIL_FROM_NAME = 'EKYAM';

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

// Encode subject for UTF-8 (emojis, special chars) using RFC 2047
const encodeSubject = (subject) => {
    const encoded = Buffer.from(subject, 'utf-8').toString('base64');
    return `=?UTF-8?B?${encoded}?=`;
};

/**
 * Send an email via the Gmail REST API.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
    const rawMessage = [
        `From: ${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDR}>`,
        `To: ${to}`,
        `Subject: ${encodeSubject(subject)}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        html,
    ].join('\r\n');

    const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
    });

    console.log(`✅ Email sent to ${to} — messageId: ${result.data.id}`);
    return result.data;
};

module.exports = sendEmail;
