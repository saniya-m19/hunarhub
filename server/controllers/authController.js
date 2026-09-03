const User = require('../models/User')
const Entrepreneur = require('../models/Entrepreneur')
const ApiError = require('../utils/ApiError')
const generateToken = require('../utils/generateToken')

const emailPattern = /^\S+@\S+\.\S+$/
const publicRoles = ['customer', 'entrepreneur']

function safeUser(user, entrepreneurId) {
  const data = { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, location: user.location, isActive: user.isActive }
  if (entrepreneurId) data.entrepreneurProfileId = entrepreneurId
  return data
}

async function register(req, res, next) {
  try {
    const { name, email, phone, password, role, location } = req.body
    if (!name || !email || !password || !role) throw new ApiError(400, 'Name, email, password, and role are required')
    if (!emailPattern.test(email)) throw new ApiError(400, 'Please provide a valid email address')
    if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters')
    if (!publicRoles.includes(role)) throw new ApiError(403, 'Public registration is only available for customers and entrepreneurs')
    if (await User.findOne({ email: email.toLowerCase() })) throw new ApiError(409, 'An account with that email already exists')
    const user = await User.create({ name, email, phone, password, role, location })
    let entrepreneurId
    if (role === 'entrepreneur') entrepreneurId = (await Entrepreneur.create({ user: user._id, location: location || '' }))._id
    res.status(201).json({ success: true, message: 'Registration successful', token: generateToken(user._id), data: { user: safeUser(user, entrepreneurId) } })
  } catch (error) { next(error) }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password || !emailPattern.test(email)) throw new ApiError(400, 'Please provide a valid email and password')
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid email or password')
    if (!user.isActive) throw new ApiError(401, 'This account is inactive')
    const profile = user.role === 'entrepreneur' ? await Entrepreneur.findOne({ user: user._id }).select('_id') : null
    res.json({ success: true, message: 'Login successful', token: generateToken(user._id), data: { user: safeUser(user, profile?._id) } })
  } catch (error) { next(error) }
}

async function me(req, res, next) {
  try {
    const profile = req.user.role === 'entrepreneur' ? await Entrepreneur.findOne({ user: req.user._id }).select('_id') : null
    res.json({ success: true, data: { user: safeUser(req.user, profile?._id) } })
  } catch (error) { next(error) }
}

async function updateMe(req, res, next) {
  try {
    ;['name', 'phone', 'location'].forEach(field => { if (req.body[field] !== undefined) req.user[field] = String(req.body[field]).trim() })
    await req.user.save()
    res.json({ success: true, data: { user: safeUser(req.user) } })
  } catch (error) { next(error) }
}

function logout(req, res) { res.json({ success: true, message: 'Logged out successfully' }) }
function protectedTest(req, res) { res.json({ success: true, message: 'Protected route accessed', data: { userId: req.user._id } }) }
function entrepreneurTest(req, res) { res.json({ success: true, message: 'Entrepreneur route accessed' }) }
function adminTest(req, res) { res.json({ success: true, message: 'Admin route accessed' }) }

module.exports = { register, login, me, updateMe, logout, protectedTest, entrepreneurTest, adminTest }
