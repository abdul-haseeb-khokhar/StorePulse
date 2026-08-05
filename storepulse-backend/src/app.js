const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const sitesRoutes = require('./modules/sites/sites.routes');
const authRoutes  = require('./modules/auth/auth.routes');
const ingestRoutes = require('./modules/ingest/ingest.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const adminAuthRoutes = require('./modules/adminAuth/adminAuth.routes');

const AppError = require('./utils/AppError')

const app = express()
// GCP VM sits behind exactly one reverse proxy (Caddy, terminating TLS via
// sslip.io) before requests reach this app — trusting one hop lets
// req.ip resolve to the real client IP from X-Forwarded-For instead of
// Caddy's own address. Needed for IP-keyed rate limiting to work correctly.
app.set('trust proxy', 1)
app.use(helmet())
app.use(express.json())

const dashboardCors = cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
    credentials: true,
})

const ingestCors = cors({
    origin: true,
    methods: ['POST'],
})
app.use('/api/auth', dashboardCors , authRoutes);
app.use('/api/sites', dashboardCors , sitesRoutes)
app.use('/api/events', ingestCors , ingestRoutes)
app.use('/api/analytics', dashboardCors , analyticsRoutes);
app.use('/api/admin/auth', dashboardCors, adminAuthRoutes);
app.use('/api/admin', dashboardCors, adminRoutes);

app.use(express.static("public"));

app.get('/health', (req, res) => { 
    res.status(200).json({ status: 'ok'})
})

app.use((req, res, next) =>{
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
});

app.use((err, req, res, next) => {
    console.error(err)
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : 'Something went wrong on server side'

    res.status(statusCode).json({message})
});

module.exports = app;