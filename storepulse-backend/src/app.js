const express = require('express')
const cors = require('cors')

const sitesRoutes = require('./modules/sites/sites.routes');
const authRoutes  = require('./modules/auth/auth.routes');
const ingestRoutes = require('../src/modules/ingest/ingest.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const AppError = require('./utils/AppError')
const { nextTick } = require('node:process')
const { appendFile } = require('node:fs')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('/api/sites', sitesRoutes)
app.use('/api/events', ingestRoutes)
app.use('/api/analytics', analyticsRoutes);

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