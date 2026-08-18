/**
 * Express application assembly: security middleware, CORS policies, route
 * mounting, and the two catch-all handlers (404 + global error) that every
 * request eventually falls through to if nothing else matches.
 */
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const sitesRoutes = require('./modules/sites/sites.routes');
const authRoutes  = require('./modules/auth/auth.routes');
const ingestRoutes = require('./modules/ingest/ingest.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const billingRoutes = require('./modules/billing/billing.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const adminAuthRoutes = require('./modules/adminAuth/adminAuth.routes');
const notificationRoutes = require('./modules/notification/notification.routes');

const AppError = require('./utils/AppError')

const app = express()

// GCP VM sits behind exactly one reverse proxy (Caddy, terminating TLS via
// sslip.io) before requests reach this app — trusting one hop lets req.ip
// resolve to the real client IP from X-Forwarded-For instead of Caddy's own
// address. Needed for IP-keyed rate limiting to work correctly.
app.set('trust proxy', 1)
app.use(helmet())
app.use(express.json())

// The dashboard (frontend origin, cookies included) and the public ingest
// endpoint (any storefront embedding the tracker script) have fundamentally
// different trust models, so they get separate CORS policies rather than one
// shared one.
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
app.use('/api/billing', dashboardCors , billingRoutes);
app.use('/api/notifications', dashboardCors, notificationRoutes);
app.use('/api/admin/auth', dashboardCors, adminAuthRoutes);
app.use('/api/admin', dashboardCors, adminRoutes);

app.use(express.static("public"));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok'})
})

// Falls through here only when no route above matched.
app.use((req, res, next) =>{
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
});

// Final handler: anything thrown or passed to next(err) anywhere upstream
// lands here. Errors we raised ourselves (AppError, carrying statusCode)
// get their real message back to the client; anything unexpected is masked
// so internals never leak into a response.
app.use((err, req, res, next) => {
    console.error(err)
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : 'Something went wrong on server side'

    res.status(statusCode).json(err.code ? { message, code: err.code } : { message })
});

module.exports = app;
