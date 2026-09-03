const mongoose = require('mongoose')
const Product = require('../models/Product')
const Category = require('../models/Category')
const ApiError = require('../utils/ApiError')

async function resolveCategory(value) {
  if (!value) return null
  if (mongoose.isValidObjectId(value)) return { category: value }
  const category = await Category.findOne({ slug: value.toLowerCase(), isActive: true }).select('_id')
  if (!category) throw new ApiError(400, 'Category not found')
  return { category: category._id }
}

async function getProducts(req, res, next) {
  try {
    const { search, category, minPrice, maxPrice } = req.query
    const filter = { isAvailable: true }
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }]
    if (minPrice || maxPrice) { filter.price = {}; if (minPrice) filter.price.$gte = Number(minPrice); if (maxPrice) filter.price.$lte = Number(maxPrice) }
    Object.assign(filter, await resolveCategory(category))
    const data = await Product.find(filter).populate('entrepreneur', 'businessName location profileImage').populate('category', 'name slug description icon').sort({ createdAt: -1 })
    res.json({ success: true, message: 'Products retrieved successfully', data })
  } catch (error) { next(error) }
}

async function getProduct(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid product identifier')
    const data = await Product.findOne({ _id: req.params.id, isAvailable: true }).populate('entrepreneur', 'businessName location profileImage').populate('category', 'name slug description icon')
    if (!data) throw new ApiError(404, 'Product not found')
    res.json({ success: true, data })
  } catch (error) { next(error) }
}

module.exports = { getProducts, getProduct }
