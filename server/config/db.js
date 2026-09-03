const mongoose = require('mongoose')

function safeDatabaseError(error) {
  return String(error?.message || 'Unknown database error').replace(/(mongodb(?:\+srv)?:\/\/)[^@\s]+@/gi, '$1[REDACTED]@')
}

async function connectDB() {
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'your_mongodb_connection_string_here') {
    throw new Error('MONGODB_URI is not configured. Add a valid MongoDB connection string to server/.env.')
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    console.log(`MongoDB connected: ${mongoose.connection.host}`)
  } catch (error) {
    console.error('MongoDB connection failed:', { name: error?.name || 'UnknownError', code: error?.code || 'UNKNOWN', message: safeDatabaseError(error) })
    throw error
  }
}

module.exports = connectDB
