const express = require('express')
const cors = require('cors')

const authRoutes  = require('./modules/auth/auth.routes')
const AppError = require('./utils/AppError')
const { nextTick } = require('node:process')
const { appendFile } = require('node:fs')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes);

app.use((req, res, next) =>{
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : 'Something went wrong on server side'

    res.status(statusCode).json({message})
});

module.exports = app;