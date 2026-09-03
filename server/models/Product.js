const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrepreneur', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true, trim: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  images: { type: [String], default: [] },
  stock: { type: Number, default: 0, min: 0 },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)
