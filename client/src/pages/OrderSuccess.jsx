import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiCheck, FiArrowRight } from 'react-icons/fi'
import { dashboardApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function OrderSuccess() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
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
          setError('Order not found')
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
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="display text-4xl text-red-600">Error</h1>
      <p className="mt-3 text-stone-600">{error || 'Order not found'}</p>
      <Link to="/products" className="mt-7 inline-flex rounded-full bg-stone-900 px-6 py-3 font-bold text-white">
        Continue Shopping
      </Link>
    </div>
  )

  const product = order.items?.[0]
  const shippingAddress = order.customerDetails || {}

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      {/* Success Header */}
      <div className="rounded-2xl bg-green-50 p-8 text-center border-2 border-green-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <FiCheck className="text-3xl text-green-600" />
        </div>
        <h1 className="display mt-4 text-4xl text-green-700">Order Placed Successfully!</h1>
        <p className="mt-2 text-lg text-stone-600">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order ID & Status */}
          <section className="rounded-2xl border border-orange-100 p-6">
            <h2 className="text-lg font-bold">Order Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-stone-600">Order ID</p>
                <p className="mt-1 font-mono text-sm font-bold text-stone-900">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600">Order Date</p>
                <p className="mt-1 font-semibold text-stone-900">
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-600">Order Status</p>
                <p className="mt-1 inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800 capitalize">
                  {order.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-600">Payment Status</p>
                <p className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 capitalize">
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </section>

          {/* Product Details */}
          <section className="rounded-2xl border border-orange-100 p-6">
            <h2 className="text-lg font-bold">Product Details</h2>
            <div className="mt-4 flex gap-4">
              {product?.productImage && (
                <img
                  src={product.productImage}
                  alt={product?.productName}
                  className="h-28 w-28 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-stone-900">{product?.productName}</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Sold by: <span className="font-semibold">{order.entrepreneurName}</span>
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Price per item:</span>
                    <span className="font-semibold">₹{product?.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Quantity:</span>
                    <span className="font-semibold">{product?.quantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold">
                    <span>Item Total:</span>
                    <span className="text-orange-600">
                      ₹{(product?.price * product?.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="rounded-2xl border border-orange-100 p-6">
            <h2 className="text-lg font-bold">Shipping Address</h2>
            <div className="mt-4 space-y-1 text-stone-700">
              <p className="font-semibold">{shippingAddress.name}</p>
              <p className="text-sm">{shippingAddress.address}</p>
              <p className="text-sm">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </p>
              <p className="text-sm">Phone: {shippingAddress.phone}</p>
            </div>
          </section>

          {/* Payment Method */}
          <section className="rounded-2xl border border-orange-100 bg-blue-50 p-6">
            <h2 className="text-lg font-bold">Payment Method</h2>
            <p className="mt-3 text-sm text-stone-600">
              <span className="font-semibold">Cash on Delivery</span>
              <br />
              Payment will be collected when your order is delivered to the address above.
            </p>
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
              View My Orders <FiArrowRight />
            </Link>
            <Link
              to="/products"
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-orange-600 px-4 py-3 font-bold text-orange-600 hover:bg-orange-50"
            >
              Continue Shopping
            </Link>
          </div>

          <p className="mt-4 text-xs text-stone-600 text-center">
            Order ID: {order._id.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  )
}
