import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheck, FiMapPin, FiStar } from 'react-icons/fi'
import { apiRequest, dashboardApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const fallbackImage = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80'

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(star => (
        <FiStar key={star} fill={star <= Math.round(rating) ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}

export default function EntrepreneurProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [data, setData] = useState(null)
  const [form, setForm] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest(`/entrepreneurs/${id}`)
      .then(result => setData(result.data))
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [id])

  const request = async serviceId => {
    if (!isAuthenticated) return setError('Please log in as a customer to request a service.')
    try {
      await dashboardApi(`/customer/services/${serviceId}/requests`, {
        method: 'POST',
        body: JSON.stringify({ description: form[serviceId] || '' })
      })
      setMessage('Service request submitted.')
      setForm({ ...form, [serviceId]: '' })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleBuyNow = (product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    navigate('/checkout', { state: { product: { ...product, entrepreneur: data.profile } } })
  }

  if (loading) return <p className="py-24 text-center font-semibold text-orange-600">Loading profile...</p>

  if (error && !data) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="display text-4xl">Entrepreneur Not Found</h1>
        <p className="mt-3 text-red-600">{error}</p>
        <Link to="/entrepreneurs" className="mt-7 inline-flex rounded-full bg-stone-900 px-6 py-3 font-bold text-white">
          Back to Browse
        </Link>
      </div>
    )
  }

  const profile = data.profile
  const reviews = Array.isArray(data.reviews) ? data.reviews : []
  const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <Link to="/entrepreneurs" className="flex items-center gap-2 text-sm font-bold text-orange-600">
        <FiArrowLeft /> Back to entrepreneurs
      </Link>

      {(message || error) && (
        <p className={`mt-5 rounded-xl p-4 ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message || error}
        </p>
      )}

      <section className="mt-8 grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <img
          src={profile.profileImage || fallbackImage}
          alt={profile.businessName || 'Entrepreneur'}
          className="h-[420px] w-full rounded-[2rem] object-cover"
        />
        <div className="self-center">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">
              {profile.category?.name || 'Local expert'}
            </span>
            {profile.isVerified && (
              <span className="flex items-center gap-1 text-sm font-bold text-green-600">
                <FiCheck /> Verified
              </span>
            )}
          </div>
          <h1 className="display mt-4 text-5xl">{profile.user?.name || profile.businessName}</h1>
          <p className="mt-2 text-xl text-stone-500">{profile.businessName}</p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm text-stone-600">
            <span className="flex items-center gap-2">
              <FiMapPin className="text-orange-500" />
              {profile.location || 'Location not provided'}
            </span>
            <span className="flex items-center gap-2 font-bold text-amber-600">
              <FiStar fill="currentColor" />
              {reviews.length ? average.toFixed(1) : 'No reviews yet'} {reviews.length ? `(${reviews.length} reviews)` : ''}
            </span>
          </div>
          <p className="mt-6 max-w-xl leading-7 text-stone-600">
            {profile.description || 'A local entrepreneur ready to help.'}
          </p>
          <p className="mt-4 text-sm font-bold capitalize text-orange-600">Availability: {profile.availability || 'available'}</p>
          <p className="mt-2 text-sm text-stone-600">{profile.experienceYears || 0} years experience · {(profile.skills || []).join(', ') || 'Skills not listed'}</p>
        </div>
      </section>

      {profile.gallery?.length > 0 && <section className="mt-10"><h2 className="display text-3xl">Gallery</h2><div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">{profile.gallery.map(image => <img key={image} src={image} alt={`${profile.businessName || 'Entrepreneur'} work`} className="aspect-square w-full rounded-2xl object-cover" />)}</div></section>}

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        {/* Services */}
        <div>
          <h2 className="display text-3xl">Services</h2>
          <div className="mt-5 grid gap-4">
            {data.services?.length ? (
              data.services.map(service => (
                <article key={service._id} className="rounded-2xl border border-orange-100 bg-white p-5">
                  <div className="flex justify-between gap-3">
                    <h3 className="font-bold">{service.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-stone-900">₹{service.price?.toLocaleString('en-IN')}</span>
                    {isAuthenticated ? (
                      <button
                        onClick={() => request(service._id)}
                        className="text-sm font-bold text-orange-600 hover:text-orange-700"
                      >
                        Request Service →
                      </button>
                    ) : (
                      <Link to="/login" className="text-sm font-bold text-orange-600 hover:text-orange-700">
                        Login to Request →
                      </Link>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p className="text-stone-500">No active services listed.</p>
            )}
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="display text-3xl">Products</h2>
          <div className="mt-5 grid gap-4">
            {data.products?.length ? (
              data.products.map(product => (
                <article key={product._id} className="rounded-2xl border border-orange-100 bg-white p-5">
                  <div className="flex gap-4">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold">{product.name}</h3>
                      <p className="mt-1 text-sm text-stone-600">{product.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-bold text-stone-900">₹{product.price?.toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => handleBuyNow(product)}
                          className="text-sm font-bold text-orange-600 hover:text-orange-700"
                        >
                          Buy Now →
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-stone-500">No products listed yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="display text-3xl">Customer Reviews</h2>
          <div className="mt-5 grid gap-4">
            {reviews.slice(0, 5).map(review => (
              <article key={review._id} className="rounded-2xl border border-orange-100 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{review.customer?.name}</p>
                    <Stars rating={review.rating} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-stone-600">{review.comment}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
