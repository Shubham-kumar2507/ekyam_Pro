const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');

dotenv.config();

const app = express();

// ─── Security Middleware ───
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ─── CORS (must be before rate limiting so 429 responses include CORS headers) ───
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
    origin: corsOrigin.split(',').map(o => o.trim()),
    credentials: true
}));

// ─── Gzip Compression ───
app.use(compression({
    level: 6,
    threshold: 1024, // only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// ─── Rate Limiting ───
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 200 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // 20 login/register attempts per 15 min
    message: { message: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth/', authLimiter);

// ─── Request Logging ───
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Body Parsing ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static files for uploads (with browser caching) ───
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : '1h',
    etag: true,
    lastModified: true
}));

// ─── API Routes ───
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/chat', require('./routes/communityChat'));
app.use('/api/events', require('./routes/communityEvents'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// ─── Health Check ───
app.get('/api', (req, res) => res.json({ message: 'Ekyam API is running', env: process.env.NODE_ENV }));

// NOTE: Frontend is deployed separately on Vercel.
// This backend serves API routes only — no static frontend files here.

// ─── Global Error Handler ───
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err.stack || err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message
    });
});

// ─── Connect to MongoDB and start server ───
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ekyam_db';

let server;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// ─── Graceful Shutdown ───
const shutdown = async (signal) => {
    console.log(`\n⏳ ${signal} received. Shutting down gracefully...`);
    if (server) {
        server.close(() => {
            console.log('🔌 HTTP server closed');
            mongoose.connection.close().then(() => {
                console.log('🗄️ MongoDB connection closed');
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }
    // Force shutdown after 10s
    setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
