const ApiError = require('../utils/ApiError')

module.exports = (error, req, res, next) => {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal server error'
  const response = { success: false, message }

  if (error.name === 'ValidationError') {
    statusCode = 400
    response.message = 'Validation failed'
    response.errors = Object.values(error.errors).map(item => item.message)
  } else if (error.name === 'CastError') {
    statusCode = 400
    response.message = `Invalid ${error.path || 'resource'} identifier`
  } else if (error.code === 11000) {
    statusCode = 409
    response.message = 'A resource with that value already exists'
  }

  if (process.env.NODE_ENV !== 'production' && error.stack) response.details = error.stack
  res.status(statusCode).json(response)
}
