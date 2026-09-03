import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { dashboardMutation } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const { product } = location.state || {}

  const [quantity, setQuantity] = useState(1)
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState({})

  // Redirect if not authenticated or no product
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
    }
    if (!product) {
      navigate('/products')
    }
  }, [isAuthenticated, product, navigate, location])

  if (!isAuthenticated || !product) return null

  const subtotal = product.price * quantity
  const shipping = 0
  const total = subtotal + shipping

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10)
    if (value > 0) setQuantity(value)
  }

  const handleDetailChange = (e) => {
    const { name, value } = e.target
    setCustomerDetails(prev => ({ ...prev, [name]: value }))
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const validateForm = () => {
    const requiredFields = ['name', 'phone', 'address', 'city', 'state', 'postalCode']
    for (const field of requiredFields) {
      if (!customerDetails[field]?.trim()) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
        return false
      }
    }
    if (quantity < 1) {
      setError('Quantity must be at least 1')
      return false
    }
    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const response = await dashboardMutation(
        `/customer/products/${product._id}/orders`,
        'POST',
        { quantity, customerDetails }
      )
      navigate(`/order-success/${response.data._id}`)
    } catch (err) {
      setError(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-5 py-12 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700"
      >
        <FiArrowLeft /> Back
      </button>

      <h1 className="display mt-6 text-3xl">Checkout</h1>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Item */}
          <section className="rounded-2xl border border-orange-100 p-6">
            <h2 className="text-xl font-bold">Order Item</h2>
            <div className="mt-4 flex gap-4">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-stone-900">{product.name}</h3>
                <p className="text-sm text-stone-600">{product.description}</p>
                <p className="mt-2 text-sm font-semibold text-stone-900">
                  by {product.entrepreneur?.businessName || 'Local Maker'}
                </p>
                <p className="mt-1 text-lg font-bold text-orange-600">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-6 border-t border-orange-100 pt-6">
              <label className="block text-sm font-bold text-stone-900">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="mt-2 w-24 rounded-lg border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
          </section>

          {/* Customer Information */}
          <section className="rounded-2xl border border-orange-100 p-6">
            <h2 className="text-xl font-bold">Delivery Address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-stone-900">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleDetailChange}
                  onBlur={() => handleBlur('name')}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                    touched.name && !customerDetails.name
                      ? 'border-red-300 bg-red-50'
                      : 'border-stone-200'
                  }`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-900">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleDetailChange}
                  onBlur={() => handleBlur('phone')}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                    touched.phone && !customerDetails.phone
                      ? 'border-red-300 bg-red-50'
                      : 'border-stone-200'
                  }`}
                  placeholder="9876543210"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-stone-900">Address *</label>
                <textarea
                  name="address"
                  value={customerDetails.address}
                  onChange={handleDetailChange}
                  onBlur={() => handleBlur('address')}
                  rows="2"
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                    touched.address && !customerDetails.address
                      ? 'border-red-300 bg-red-50'
                      : 'border-stone-200'
                  }`}
                  placeholder="Street address, building, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-900">City *</label>
                <input
                  type="text"
                  name="city"
                  value={customerDetails.city}
                  onChange={handleDetailChange}
                  onBlur={() => handleBlur('city')}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                    touched.city && !customerDetails.city
                      ? 'border-red-300 bg-red-50'
                      : 'border-stone-200'
                  }`}
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-900">State *</label>
                <input
                  type="text"
                  name="state"
                  value={customerDetails.state}
                  onChange={handleDetailChange}
                  onBlur={() => handleBlur('state')}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                    touched.state && !customerDetails.state
                      ? 'border-red-300 bg-red-50'
                      : 'border-stone-200'
                  }`}
                  placeholder="Maharashtra"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-900">Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={customerDetails.postalCode}
                  onChange={handleDetailChange}
                  onBlur={() => handleBlur('postalCode')}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                    touched.postalCode && !customerDetails.postalCode
                      ? 'border-red-300 bg-red-50'
                      : 'border-stone-200'
                  }`}
                  placeholder="400001"
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="rounded-2xl border border-orange-100 p-6 bg-blue-50">
            <h2 className="text-xl font-bold">Payment Method</h2>
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full border-2 border-orange-500 bg-orange-50"></div>
                <span className="font-semibold text-stone-900">Cash on Delivery</span>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                Payment will be collected when your order is delivered. No online payment gateway is connected yet.
              </p>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="h-fit rounded-2xl border border-orange-100 bg-orange-50 p-6 sticky top-4">
          <h2 className="text-xl font-bold text-stone-900">Order Summary</h2>

          <div className="mt-6 space-y-3 border-b border-orange-200 pb-6">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">
                ₹{product.price.toLocaleString('en-IN')} × {quantity}
              </span>
              <span className="font-semibold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Shipping</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
          </div>

          <div className="mt-6 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-orange-600">₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>

          <p className="mt-4 text-xs text-stone-600 text-center">
            By placing an order, you agree to our terms and conditions.
          </p>
        </div>
      </div>
    </div>
  )
}
