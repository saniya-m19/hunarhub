const mongoose = require('mongoose')

const entrepreneurSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, trim: true, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  skills: { type: [String], default: [] },
  experienceYears: { type: Number, default: 0, min: 0 },
  description: String,
  location: { type: String, trim: true, default: '' },
  profileImage: String,
  gallery: { type: [String], default: [] },
  startingPrice: { type: Number, default: 0, min: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Entrepreneur', entrepreneurSchema)
