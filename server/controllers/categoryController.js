const mongoose = require('mongoose')
const Category = require('../models/Category')
const ApiError = require('../utils/ApiError')

async function getCategories(req, res, next) {
  try {
    const data = await Category.find({ isActive: true }).sort({ name: 1 })
    res.json({ success: true, message: 'Categories retrieved successfully', data })
  } catch (error) { next(error) }
}

async function getCategory(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid category identifier')
    const data = await Category.findOne({ _id: req.params.id, isActive: true })
    if (!data) throw new ApiError(404, 'Category not found')
    res.json({ success: true, data })
  } catch (error) { next(error) }
}

module.exports = { getCategories, getCategory }
