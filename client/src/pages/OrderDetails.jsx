import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiPackage, FiTruck, FiDollarSign } from 'react-icons/fi'
import { dashboardApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Fetch order details
    dashboardApi(`/customer/resources`)
      .then(result => {
        const foundOrder = result.data.orders?.find(o => o._id === id)
        if (foundOrder) {
          setOrder(foundOrder)
        } else {
          setError('Order not found or you do not have access to this order')
        }
      })
      .catch(err => setError(err.message || 'Failed to load order'))
      .finally(() => setLoading(false))
  }, [id, isAuthenticated, navigate])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-center font-semibold text-orange-600">Loading order details...</p>
    </div>
  )

  if (error || !order) return (
    <div className="mx-auto max-w-2xl px-5 py-24">
      <div className="rounded-2xl bg-red-50 p-8 text-center border-2 border-red-200">
        <h1 className="text-2xl font-bold text-red-700">Order Not Found</h1>
        <p className="mt-3 text-stone-600">{error}</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700"
        >
          Back to My Orders
        </Link>
      </div>
    </div>
  )

  const product = order.items?.[0]
  const shippingAddress = order.customerDetails || {}
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 mb-6"
      >
        <FiArrowLeft /> Back to My Orders
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <section className="rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="display text-3xl">Order #{order._id.slice(-8).toUpperCase()}</h1>
                <p className="mt-2 text-stone-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className={`rounded-lg px-4 py-2 font-semibold ${statusColors[order.status] || 'bg-gray-100'}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
          </section>

          {/* Product Information */}
          <section className="rounded-2xl border border-orange-100 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <FiPackage className="text-orange-600" /> Product Details
            </h2>
            <div className="mt-4 flex gap-4">
              {product?.productImage && (
                <img
                  src={product.productImage}
                  alt={product?.productName}
                  className="h-32 w-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-stone-900">{product?.productName}</h3>
                <p className="mt-1 text-stone-600">
                  From: <span className="font-semibold">{order.entrepreneurName}</span>
                </p>
                <div className="mt-4 space-y-2 border-t border-stone-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Price</span>
                    <span className="font-semibold">₹{product?.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Quantity</span>
                    <span className="font-semibold">{product?.quantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-2 text-lg font-bold text-orange-600">
                    <span>Item Total</span>
                    <span>₹{(product?.price * product?.quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="rounded-2xl border border-orange-100 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <FiTruck className="text-orange-600" /> Delivery Address
            </h2>
            <div className="mt-4 space-y-1 text-stone-700">
              <p className="font-semibold text-lg">{shippingAddress.name}</p>
              <p className="text-sm">{shippingAddress.address}</p>
              <p className="text-sm">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Phone:</span> {shippingAddress.phone}
              </p>
            </div>
          </section>

          {/* Payment Information */}
          <section className="rounded-2xl border border-orange-100 bg-blue-50 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <FiDollarSign className="text-orange-600" /> Payment Information
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Payment Method</span>
                <span className="font-semibold">Cash on Delivery</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Payment Status</span>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100'}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
              {order.paymentStatus === 'pending' && (
                <p className="mt-2 text-sm text-blue-800 bg-blue-100 rounded p-2">
                  Payment will be collected when your order is delivered.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Summary Sidebar */}
        <div className="h-fit rounded-2xl border border-orange-100 bg-orange-50 p-6 sticky top-4">
          <h2 className="text-lg font-bold text-stone-900">Order Summary</h2>

          <div className="mt-6 space-y-3 border-b border-orange-200 pb-6">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Subtotal</span>
              <span className="font-semibold">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Shipping</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
          </div>

          <div className="mt-6 flex justify-between text-xl font-bold text-orange-600">
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="mt-6 space-y-2">
            <Link
              to="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700"
            >
              Back to All Orders
            </Link>
            <Link
              to="/products"
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-orange-600 px-4 py-3 font-bold text-orange-600 hover:bg-orange-50"
            >
              Continue Shopping
            </Link>
          </div>

          <div className="mt-4 space-y-1 border-t border-orange-200 pt-4">
            <p className="text-xs text-stone-600">
              <span className="font-semibold">Order ID:</span> {order._id.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-stone-600">
              <span className="font-semibold">Order Date:</span> {new Date(order.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
