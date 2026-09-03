const jwt = require('jsonwebtoken')

module.exports = userId => jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
})
