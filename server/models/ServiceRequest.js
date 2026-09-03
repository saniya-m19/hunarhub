const mongoose = require('mongoose')

const serviceRequestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrepreneur', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  description: { type: String, required: true },
  preferredDate: Date,
  location: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
}, { timestamps: true })

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema)
