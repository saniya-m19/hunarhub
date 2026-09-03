const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env'), override: false })
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const entrepreneurRoutes = require('./routes/entrepreneurRoutes')
const productRoutes = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const notFoundMiddleware = require('./middleware/notFoundMiddleware')
const errorMiddleware = require('./middleware/errorMiddleware')

const app = express()
const port = Number(process.env.PORT) || 5000
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(origin => origin.trim()).filter(Boolean)

app.use(cors({ origin: allowedOrigin => !allowedOrigin || allowedOrigins.includes(allowedOrigin) }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ success: true, message: 'HunarHub API is running' }))
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/entrepreneurs', entrepreneurRoutes)
app.use('/api/products', productRoutes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

async function startServer() {
  try {
    console.log('Startup environment:', { hasJwtSecret: Boolean(process.env.JWT_SECRET), jwtSecretIsPlaceholder: process.env.JWT_SECRET === 'replace_with_a_long_random_secret', hasMongoUri: Boolean(process.env.MONGODB_URI), nodeEnv: process.env.NODE_ENV || 'undefined', port: process.env.PORT || 'undefined' })
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace_with_a_long_random_secret') throw new Error('JWT_SECRET is not configured.')
    await connectDB()
    app.listen(port, () => console.log(`HunarHub API listening on port ${port}`))
  } catch (error) {
    console.error('Server startup aborted.')
    console.error('Startup error details:', { name: error?.name || 'UnknownError', code: error?.code || 'UNKNOWN', message: String(error?.message || 'Unknown startup error').replace(/(mongodb(?:\+srv)?:\/\/)[^@\s]+@/gi, '$1[REDACTED]@') })
    process.exitCode = 1
  }
}

if (require.main === module) startServer()
module.exports = app
