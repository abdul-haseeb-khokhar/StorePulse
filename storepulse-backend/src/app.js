const express = require('express')
const cors = require('cors')

const sitesRoutes = require('./modules/sites/sites.routes');
const authRoutes  = require('./modules/auth/auth.routes');
const ingestRoutes = require('./modules/ingest/ingest.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const AppError = require('./utils/AppError')

const app = express()
app.use(express.json())

const dashboardCors = cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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