const mongoose = require('mongoose')
const User = require('../models/User')
const Entrepreneur = require('../models/Entrepreneur')
const Category = require('../models/Category')
const Service = require('../models/Service')
const Product = require('../models/Product')
const ServiceRequest = require('../models/ServiceRequest')
const Order = require('../models/Order')
const Review = require('../models/Review')
const Complaint = require('../models/Complaint')
const ApiError = require('../utils/ApiError')

const id = value => { if (!mongoose.isValidObjectId(value)) throw new ApiError(400, 'Invalid identifier'); return value }
const ownProfile = async userId => { const profile = await Entrepreneur.findOne({ user: userId }); if (!profile) throw new ApiError(404, 'Entrepreneur profile not found'); return profile }
const clean = value => typeof value === 'string' ? value.trim() : value
const search = (...fields) => { const value = fields.pop(); return value ? { $or: fields.map(field => ({ [field]: { $regex: value, $options: 'i' } })) } : {} }

async function customerDashboard(req, res, next) { try {
  const customer = req.user._id
  const [requests, orders, reviews] = await Promise.all([
    ServiceRequest.find({ customer }).sort({ createdAt: -1 }).limit(5).populate('service', 'title').populate('entrepreneur', 'businessName'),
    Order.find({ customer }).sort({ createdAt: -1 }).limit(5).populate('items.product', 'name'),
    Review.find({ customer }).sort({ createdAt: -1 }).limit(5).populate('entrepreneur', 'businessName'),
  ])
  const [activeRequests, completedOrders, totalReviews] = await Promise.all([ServiceRequest.countDocuments({ customer, status: { $in: ['pending', 'accepted', 'in_progress'] } }), Order.countDocuments({ customer, status: 'completed' }), Review.countDocuments({ customer })])
  res.json({ success: true, data: { stats: { activeRequests, completedOrders, totalReviews }, requests, orders, reviews } })
} catch (error) { next(error) } }

async function customerResource(req, res, next) { try {
  const query = { customer: req.user._id }
  const [requests, orders, reviews, complaints] = await Promise.all([ServiceRequest.find({ ...query, ...(req.query.status ? { status: req.query.status } : {}) }).sort({ createdAt: -1 }).populate('service', 'title').populate('entrepreneur', 'businessName'), Order.find(query).sort({ createdAt: -1 }).populate('items.product', 'name').populate('entrepreneur', 'businessName'), Review.find(query).sort({ createdAt: -1 }).populate('entrepreneur', 'businessName'), Complaint.find(query).sort({ createdAt: -1 }).populate('entrepreneur', 'businessName').populate('order', 'totalAmount status').populate('serviceRequest', 'description status')])
  res.json({ success: true, data: { requests, orders, reviews, complaints } })
} catch (error) { next(error) } }

async function entrepreneurDashboard(req, res, next) { try {
  const profile = await ownProfile(req.user._id); const entrepreneur = profile._id
  const [services, products, requests, orders, reviews] = await Promise.all([Service.find({ entrepreneur }).sort({ createdAt: -1 }), Product.find({ entrepreneur }).sort({ createdAt: -1 }).populate('category', 'name'), ServiceRequest.find({ entrepreneur }).sort({ createdAt: -1 }).limit(5).populate('customer', 'name').populate('service', 'title'), Order.find({ entrepreneur }).sort({ createdAt: -1 }).limit(5).populate('customer', 'name').populate('items.product', 'name'), Review.find({ entrepreneur }).sort({ createdAt: -1 }).limit(5).populate('customer', 'name')])
  const [activeServices, productsListed, newRequests, completedOrders, totalReviews, earnings] = await Promise.all([Service.countDocuments({ entrepreneur, isActive: true }), Product.countDocuments({ entrepreneur }), ServiceRequest.countDocuments({ entrepreneur, status: 'pending' }), Order.countDocuments({ entrepreneur, status: 'completed' }), Review.countDocuments({ entrepreneur }), Order.aggregate([{ $match: { entrepreneur, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])])
  const averageRating = reviews.length ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)) : 0
  res.json({ success: true, data: { profile, stats: { activeServices, productsListed, newRequests, completedOrders, earnings: Number((earnings[0]?.total || 0).toFixed(2)), averageRating, totalReviews }, services, products, requests, orders, reviews } })
} catch (error) { next(error) } }

async function entrepreneurProfile(req, res, next) { try { res.json({ success: true, data: { profile: await ownProfile(req.user._id) } }) } catch (error) { next(error) } }
async function updateEntrepreneurProfile(req, res, next) { try { const profile = await ownProfile(req.user._id); const fields = ['businessName', 'description', 'location', 'skills', 'category', 'profileImage', 'gallery', 'startingPrice', 'experienceYears', 'availability']; fields.forEach(field => { if (req.body[field] !== undefined) profile[field] = clean(req.body[field]) }); ['name', 'phone', 'location'].forEach(field => { if (req.body[field] !== undefined) req.user[field] = clean(req.body[field]) }); await Promise.all([profile.save(), req.user.save()]); res.json({ success: true, data: { profile } }) } catch (error) { next(error) } }

const ownerResources = (Model, ownerField, populate) => async (req, res, next) => { try { const profile = await ownProfile(req.user._id); const docs = await Model.find({ [ownerField]: profile._id }).sort({ createdAt: -1 }).populate(populate || ''); res.json({ success: true, data: docs }) } catch (error) { next(error) } }
async function createOwned(Model, fields, req, res, next) { try { const profile = await ownProfile(req.user._id); const data = {}; fields.forEach(field => { if (req.body[field] !== undefined) data[field] = req.body[field] }); data.entrepreneur = profile._id; const doc = await Model.create(data); res.status(201).json({ success: true, data: doc }) } catch (error) { next(error) } }
const createService = (req, res, next) => createOwned(Service, ['category', 'title', 'description', 'price', 'priceType', 'estimatedDuration', 'isActive'], req, res, next)
const createProduct = (req, res, next) => createOwned(Product, ['category', 'name', 'description', 'price', 'images', 'stock', 'isAvailable'], req, res, next)
async function updateOwned(Model, fields, req, res, next) { try { id(req.params.id); const profile = await ownProfile(req.user._id); const doc = await Model.findOne({ _id: req.params.id, entrepreneur: profile._id }); if (!doc) throw new ApiError(404, 'Resource not found'); fields.forEach(field => { if (req.body[field] !== undefined) doc[field] = req.body[field] }); await doc.save(); res.json({ success: true, data: doc }) } catch (error) { next(error) } }
const updateService = (req, res, next) => updateOwned(Service, ['category', 'title', 'description', 'price', 'priceType', 'estimatedDuration', 'isActive'], req, res, next)
const updateProduct = (req, res, next) => updateOwned(Product, ['category', 'name', 'description', 'price', 'images', 'stock', 'isAvailable'], req, res, next)
async function deleteOwned(Model, req, res, next) { try { id(req.params.id); const profile = await ownProfile(req.user._id); const result = await Model.deleteOne({ _id: req.params.id, entrepreneur: profile._id }); if (!result.deletedCount) throw new ApiError(404, 'Resource not found'); res.json({ success: true, message: 'Deleted successfully' }) } catch (error) { next(error) } }
const deleteService = (req, res, next) => deleteOwned(Service, req, res, next); const deleteProduct = (req, res, next) => deleteOwned(Product, req, res, next)
async function entrepreneurResources(req, res, next) { try { const profile = await ownProfile(req.user._id); const [requests, orders, reviews] = await Promise.all([ServiceRequest.find({ entrepreneur: profile._id }).sort({ createdAt: -1 }).populate('customer', 'name').populate('service', 'title'), Order.find({ entrepreneur: profile._id }).sort({ createdAt: -1 }).populate('customer', 'name').populate('items.product', 'name'), Review.find({ entrepreneur: profile._id }).sort({ createdAt: -1 }).populate('customer', 'name')]); res.json({ success: true, data: { requests, orders, reviews } }) } catch (error) { next(error) } }
const requestTransitions = { pending: ['accepted', 'rejected'], accepted: ['completed', 'cancelled'], in_progress: ['completed', 'cancelled'] }
const orderTransitions = { pending: ['confirmed', 'cancelled'], confirmed: ['processing', 'cancelled'], processing: ['completed'] }
function nextStatus(transitions, current, requested) { if (!transitions[current]?.includes(requested)) throw new ApiError(400, `Cannot change status from ${current} to ${requested}`) }
async function updateRequestStatus(req, res, next) { try { id(req.params.id); const profile = await ownProfile(req.user._id); const doc = await ServiceRequest.findOne({ _id: req.params.id, entrepreneur: profile._id }); if (!doc) throw new ApiError(404, 'Request not found'); nextStatus(requestTransitions, doc.status, req.body.status); doc.status = req.body.status; await doc.save(); res.json({ success: true, data: doc }) } catch (error) { next(error) } }

async function createServiceRequest(req, res, next) { try { id(req.params.serviceId); const service = await Service.findOne({ _id: req.params.serviceId, isActive: true }).populate('entrepreneur'); if (!service) throw new ApiError(404, 'Service not found'); if (String(service.entrepreneur.user) === String(req.user._id)) throw new ApiError(400, 'You cannot request your own service'); if (!req.body.description?.trim()) throw new ApiError(400, 'Requirements are required'); const request = await ServiceRequest.create({ customer: req.user._id, entrepreneur: service.entrepreneur._id, service: service._id, description: req.body.description.trim(), preferredDate: req.body.preferredDate, location: req.body.location }); res.status(201).json({ success: true, data: request }) } catch (error) { next(error) } }
async function createComplaint(req, res, next) {
  try {
    const { entrepreneur: entrepreneurId, order: orderId, serviceRequest: requestId, subject, description } = req.body
    id(entrepreneurId)
    if (!subject?.trim()) throw new ApiError(400, 'Subject is required')
    if (!description?.trim()) throw new ApiError(400, 'Description is required')
    const entrepreneur = await Entrepreneur.findById(entrepreneurId)
    if (!entrepreneur) throw new ApiError(404, 'Entrepreneur not found')
    const complaint = { customer: req.user._id, entrepreneur: entrepreneur._id, subject: subject.trim(), description: description.trim() }
    if (orderId) {
      id(orderId)
      const order = await Order.findOne({ _id: orderId, customer: req.user._id, entrepreneur: entrepreneur._id })
      if (!order) throw new ApiError(400, 'Order does not belong to this customer and entrepreneur')
      complaint.order = order._id
    }
    if (requestId) {
      id(requestId)
      const request = await ServiceRequest.findOne({ _id: requestId, customer: req.user._id, entrepreneur: entrepreneur._id })
      if (!request) throw new ApiError(400, 'Service request does not belong to this customer and entrepreneur')
      complaint.serviceRequest = request._id
    }
    const created = await Complaint.create(complaint)
    res.status(201).json({ success: true, data: created })
  } catch (error) { next(error) }
}
async function updateCustomerRequestStatus(req, res, next) { try { id(req.params.id); const request = await ServiceRequest.findOne({ _id: req.params.id, customer: req.user._id }); if (!request) throw new ApiError(404, 'Request not found'); nextStatus({ pending: ['cancelled'] }, request.status, req.body.status); request.status = req.body.status; await request.save(); res.json({ success: true, data: request }) } catch (error) { next(error) } }
async function createOrder(req, res, next) {
  try {
    // Validate product ID
    id(req.params.productId)
    
    // Load product from database
    const product = await Product.findOne({ _id: req.params.productId, isAvailable: true }).populate('entrepreneur')
    if (!product) throw new ApiError(404, 'Product not found')
    
    // Validate quantity
    const quantity = Number(req.body.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) throw new ApiError(400, 'Quantity must be at least 1')
    if (product.stock && quantity > product.stock) throw new ApiError(400, 'Insufficient stock available')
    
    // Validate customer details
    const { name, phone, address, city, state, postalCode } = req.body.customerDetails || {}
    if (!name?.trim()) throw new ApiError(400, 'Customer name is required')
    if (!phone?.trim()) throw new ApiError(400, 'Phone number is required')
    if (!address?.trim()) throw new ApiError(400, 'Address is required')
    if (!city?.trim()) throw new ApiError(400, 'City is required')
    if (!state?.trim()) throw new ApiError(400, 'State is required')
    if (!postalCode?.trim()) throw new ApiError(400, 'Postal code is required')
    
    // Calculate totals server-side
    const price = product.price
    const subtotal = price * quantity
    const shipping = 0 // Free shipping for now
    const totalAmount = subtotal + shipping
    
    // Create order with all required fields
    const order = await Order.create({
      customer: req.user._id,
      entrepreneur: product.entrepreneur._id,
      items: [{
        product: product._id,
        quantity,
        price,
        productName: product.name,
        productImage: product.images?.[0] || ''
      }],
      subtotal,
      shipping,
      totalAmount,
      status: 'pending',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      customerDetails: {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim()
      },
      entrepreneurName: product.entrepreneur.businessName || ''
    })
    
    // Deduct stock if available
    if (product.stock > 0) {
      product.stock -= quantity
      if (product.stock <= 0) product.isAvailable = false
      await product.save()
    }
    
    res.status(201).json({ success: true, data: order })
  } catch (error) { next(error) }
}
async function updateCustomerOrderStatus(req, res, next) { try { id(req.params.id); const order = await Order.findOne({ _id: req.params.id, customer: req.user._id }); if (!order) throw new ApiError(404, 'Order not found'); nextStatus({ pending: ['cancelled'], confirmed: ['cancelled'] }, order.status, req.body.status); order.status = req.body.status; await order.save(); res.json({ success: true, data: order }) } catch (error) { next(error) } }
async function updateOrderStatus(req, res, next) { try { id(req.params.id); const profile = await ownProfile(req.user._id); const order = await Order.findOne({ _id: req.params.id, entrepreneur: profile._id }); if (!order) throw new ApiError(404, 'Order not found'); nextStatus(orderTransitions, order.status, req.body.status); order.status = req.body.status; await order.save(); res.json({ success: true, data: order }) } catch (error) { next(error) } }
async function createReview(req, res, next) { try { id(req.params.entrepreneurId); const entrepreneur = await Entrepreneur.findById(req.params.entrepreneurId); if (!entrepreneur) throw new ApiError(404, 'Entrepreneur not found'); const completed = await Promise.all([ServiceRequest.exists({ customer: req.user._id, entrepreneur: entrepreneur._id, status: 'completed' }), Order.exists({ customer: req.user._id, entrepreneur: entrepreneur._id, status: 'completed' })]); if (!completed.some(Boolean)) throw new ApiError(400, 'Complete a transaction before reviewing'); if (await Review.exists({ customer: req.user._id, entrepreneur: entrepreneur._id })) throw new ApiError(409, 'You have already reviewed this entrepreneur'); const review = await Review.create({ customer: req.user._id, entrepreneur: entrepreneur._id, rating: Number(req.body.rating), comment: req.body.comment }); const aggregate = await Review.aggregate([{ $match: { entrepreneur: entrepreneur._id } }, { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }]); await Entrepreneur.findByIdAndUpdate(entrepreneur._id, { averageRating: aggregate[0].averageRating, totalReviews: aggregate[0].totalReviews }); res.status(201).json({ success: true, data: review }) } catch (error) { next(error) } }

async function adminDashboard(req, res, next) { try {
  const [[totalUsers, totalCustomers, totalEntrepreneurs], totalVerifiedEntrepreneurs, totalProducts, totalServices, totalRequests, totalOrders, totalComplaints, activeUsers, completedRequests, sales, earnings, satisfaction] = await Promise.all([
    Promise.all([User.countDocuments(), User.countDocuments({ role: 'customer' }), User.countDocuments({ role: 'entrepreneur' })]),
    Entrepreneur.countDocuments({ isVerified: true }), Product.countDocuments(), Service.countDocuments(), ServiceRequest.countDocuments(), Order.countDocuments(), Complaint.countDocuments(),
    User.countDocuments({ isActive: true, role: { $in: ['customer', 'entrepreneur'] } }), ServiceRequest.countDocuments({ status: 'completed' }),
    Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, volume: { $sum: { $sum: '$items.quantity' } } } }]),
    Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: '$entrepreneur', earnings: { $sum: '$totalAmount' } } }, { $group: { _id: null, average: { $avg: '$earnings' } } }]),
    Review.aggregate([{ $group: { _id: null, average: { $avg: '$rating' } } }]),
  ])
  const conversionRate = totalRequests ? Number(((completedRequests / totalRequests) * 100).toFixed(1)) : 0
  res.json({ success: true, data: { stats: { totalUsers, totalCustomers, totalEntrepreneurs, totalVerifiedEntrepreneurs, totalProducts, totalServices, totalRequests, totalOrders, totalComplaints, registeredEntrepreneurs: totalEntrepreneurs, activeUsers, serviceRequestConversionRate: conversionRate, productSalesVolume: sales[0]?.volume || 0, averageEntrepreneurEarnings: Number((earnings[0]?.average || 0).toFixed(2)), customerSatisfactionRating: Number((satisfaction[0]?.average || 0).toFixed(1)) } } })
} catch (error) { next(error) } }
async function adminResources(req, res, next) { try { const [users, entrepreneurs, products, categories, requests, orders, complaints] = await Promise.all([User.find({ ...search('name', 'email', req.query.search), ...(req.query.role ? { role: req.query.role } : {}) }).select('-password').sort({ createdAt: -1 }), Entrepreneur.find(search('businessName', 'location', req.query.search)).populate('user', 'name email phone'), Product.find(search('name', 'description', req.query.search)).populate('category', 'name').populate('entrepreneur', 'businessName'), Category.find().sort({ name: 1 }), ServiceRequest.find(req.query.status ? { status: req.query.status } : {}).populate('customer', 'name email').populate('entrepreneur', 'businessName').populate('service', 'title'), Order.find().sort({ createdAt: -1 }).populate('customer', 'name email').populate('entrepreneur', 'businessName').populate('items.product', 'name'), Complaint.find(req.query.complaintStatus ? { status: req.query.complaintStatus } : {}).sort({ createdAt: -1 }).populate('customer', 'name email').populate('entrepreneur', 'businessName').populate('order', 'totalAmount').populate('serviceRequest', 'description')]); res.json({ success: true, data: { users, entrepreneurs, products, categories, requests, orders, complaints } }) } catch (error) { next(error) } }
async function updateComplaintStatus(req, res, next) { try { id(req.params.id); const statuses = ['open', 'under_review', 'resolved', 'rejected']; if (!statuses.includes(req.body.status)) throw new ApiError(400, 'Invalid complaint status'); const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!complaint) throw new ApiError(404, 'Complaint not found'); res.json({ success: true, data: complaint }) } catch (error) { next(error) } }
async function updateAdminEntrepreneurSkills(req, res, next) { try { id(req.params.id); const skills = Array.isArray(req.body.skills) ? req.body.skills : String(req.body.skills || '').split(','); const profile = await Entrepreneur.findByIdAndUpdate(req.params.id, { skills: skills.map(skill => String(skill).trim()).filter(Boolean) }, { new: true, runValidators: true }); if (!profile) throw new ApiError(404, 'Entrepreneur not found'); res.json({ success: true, data: profile }) } catch (error) { next(error) } }
async function updateEntrepreneurVerification(req, res, next) { try { id(req.params.id); const profile = await Entrepreneur.findByIdAndUpdate(req.params.id, { isVerified: Boolean(req.body.isVerified) }, { new: true }); if (!profile) throw new ApiError(404, 'Entrepreneur not found'); res.json({ success: true, data: profile }) } catch (error) { next(error) } }
async function deleteAdminProduct(req, res, next) { try { id(req.params.id); const product = await Product.findByIdAndDelete(req.params.id); if (!product) throw new ApiError(404, 'Product not found'); res.json({ success: true, message: 'Product removed' }) } catch (error) { next(error) } }
async function categoryWrite(req, res, next) { try { if (req.params.id) id(req.params.id); const data = { name: clean(req.body.name), slug: clean(req.body.slug || req.body.name?.toLowerCase().replace(/\s+/g, '-')), description: req.body.description, icon: req.body.icon }; if (!data.name) throw new ApiError(400, 'Category name is required'); const category = req.params.id ? await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }) : await Category.create(data); if (!category) throw new ApiError(404, 'Category not found'); res.status(req.params.id ? 200 : 201).json({ success: true, data: category }) } catch (error) { next(error) } }
async function deleteCategory(req, res, next) { try { id(req.params.id); const referenced = await Promise.all([Product.exists({ category: req.params.id }), Service.exists({ category: req.params.id }), Entrepreneur.exists({ category: req.params.id })]); if (referenced.some(Boolean)) throw new ApiError(400, 'Category is in use and cannot be deleted'); const category = await Category.findByIdAndDelete(req.params.id); if (!category) throw new ApiError(404, 'Category not found'); res.json({ success: true, message: 'Category deleted' }) } catch (error) { next(error) } }

module.exports = { customerDashboard, customerResource, entrepreneurDashboard, entrepreneurProfile, updateEntrepreneurProfile, ownerResources, createService, createProduct, updateService, updateProduct, deleteService, deleteProduct, entrepreneurResources, updateRequestStatus, createServiceRequest, createComplaint, updateCustomerRequestStatus, createOrder, updateCustomerOrderStatus, updateOrderStatus, createReview, adminDashboard, adminResources, updateComplaintStatus, updateAdminEntrepreneurSkills, updateEntrepreneurVerification, deleteAdminProduct, categoryWrite, deleteCategory }