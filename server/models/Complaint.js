const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrepreneur', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { type: String, enum: ['open', 'under_review', 'resolved', 'rejected'], default: 'open' },
}, { timestamps: true })

module.exports = mongoose.model('Complaint', complaintSchema)