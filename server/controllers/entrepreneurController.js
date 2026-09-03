const mongoose = require('mongoose')
const Entrepreneur = require('../models/Entrepreneur')
const Category = require('../models/Category')
const Service = require('../models/Service')
const Product = require('../models/Product')
const Review = require('../models/Review')
const ApiError = require('../utils/ApiError')

async function resolveCategory(value) {
  if (!value) return null
  if (mongoose.isValidObjectId(value)) return { category: value }
  const category = await Category.findOne({ slug: value.toLowerCase(), isActive: true }).select('_id')
  if (!category) throw new ApiError(400, 'Category not found')
  return { category: category._id }
}

async function getEntrepreneurs(req, res, next) {
  try {
    const { search, category, location, minPrice, maxPrice } = req.query
    const filter = { isActive: true }
    if (search) filter.$or = [{ businessName: { $regex: search, $options: 'i' } }, { skills: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }]
    if (location) filter.location = { $regex: location, $options: 'i' }
    if (minPrice || maxPrice) { filter.startingPrice = {}; if (minPrice) filter.startingPrice.$gte = Number(minPrice); if (maxPrice) filter.startingPrice.$lte = Number(maxPrice) }
    Object.assign(filter, await resolveCategory(category))
    const data = await Entrepreneur.find(filter).populate('category', 'name slug description icon').populate('user', 'name location').sort({ createdAt: -1 })
    res.json({ success: true, message: 'Entrepreneurs retrieved successfully', data })
  } catch (error) { next(error) }
}

async function getEntrepreneur(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid entrepreneur identifier')
    const data = await Entrepreneur.findOne({ _id: req.params.id, isActive: true }).populate('category', 'name slug description icon').populate('user', 'name location')
    if (!data) throw new ApiError(404, 'Entrepreneur not found')
    const [services, products, reviews] = await Promise.all([Service.find({ entrepreneur: data._id, isActive: true }).populate('category', 'name slug'), Product.find({ entrepreneur: data._id, isAvailable: true }).populate('category', 'name slug'), Review.find({ entrepreneur: data._id }).sort({ createdAt: -1 }).populate('customer', 'name')])
    res.json({ success: true, data: { profile: data, services, products, reviews } })
  } catch (error) { next(error) }
}

module.exports = { getEntrepreneurs, getEntrepreneur }
