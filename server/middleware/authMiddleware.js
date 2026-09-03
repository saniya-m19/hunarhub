const jwt = require('jsonwebtoken')
const User = require('../models/User')
const ApiError = require('../utils/ApiError')

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) throw new ApiError(401, 'Authentication required')
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')
    if (!user || !user.isActive) throw new ApiError(401, 'Authentication is no longer valid')
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return next(new ApiError(401, 'Invalid or expired token'))
    next(error)
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'))
    if (!roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to access this resource'))
    next()
  }
}

module.exports = { protect, authorize }
