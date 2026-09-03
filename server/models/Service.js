const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
  entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrepreneur', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  priceType: { type: String, enum: ['fixed', 'starting_from', 'hourly'], default: 'fixed' },
  estimatedDuration: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Service', serviceSchema)
