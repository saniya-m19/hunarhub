import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiSliders } from 'react-icons/fi'
import { apiRequest } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Products() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [max, setMax] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([apiRequest('/products'), apiRequest('/categories')])
      .then(([productResult, categoryResult]) => {
        setProducts(productResult.data)
        setCategories(categoryResult.data)
      })
      .catch(requestError => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const results = products.filter(
    product =>
      `${product.name} ${product.description || ''}`.toLowerCase().includes(query.toLowerCase()) &&
      (!category || product.category?._id === category) &&
      (!max || product.price <= Number(max))
  )

  const handleBuyNow = (product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    navigate('/checkout', { state: { product } })
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <div className="max-w-2xl">
        <p className="font-bold uppercase tracking-widest text-orange-600">The local shelf</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">Objects with a story to tell.</h1>
        <p className="mt-4 leading-7 text-stone-600">
          Shop useful, beautiful things made in small batches by entrepreneurs in our community.
        </p>
      </div>

      <div className="mt-10 grid gap-3 rounded-2xl border border-orange-100 bg-white p-4 md:grid-cols-3">
        <label className="flex items-center gap-2 rounded-xl bg-stone-50 px-3">
          <FiSearch className="text-orange-500" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent py-3 text-sm outline-none"
          />
        </label>

        <select
          value={category}
          onChange={event => setCategory(event.target.value)}
          className="rounded-xl bg-stone-50 px-3 py-3 text-sm outline-none"
        >
          <option value="">All categories</option>
          {categories.map(item => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={max}
          onChange={event => setMax(event.target.value)}
          className="rounded-xl bg-stone-50 px-3 py-3 text-sm outline-none"
        >
          <option value="">Any price</option>
          <option value="500">Under 500</option>
          <option value="1000">Under 1,000</option>
          <option value="1500">Under 1,500</option>
        </select>

        <button
          onClick={() => {
            setQuery('')
            setCategory('')
            setMax('')
          }}
          className="flex items-center gap-2 text-sm font-bold text-orange-600 md:col-span-3"
        >
          <FiSliders /> Clear filters
        </button>
      </div>

      {loading ? (
        <p className="py-16 text-center font-semibold text-orange-600">Loading products...</p>
      ) : error ? (
        <p className="mt-10 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
      ) : (
        <>
          <h2 className="mt-12 text-xl font-bold">{results.length} products</h2>
          {results.length ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {results.map(product => (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100"
                >
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-56 w-full object-cover"
                    />
                  )}
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      {product.category?.name}
                    </p>
                    <h3 className="mt-1 font-bold text-stone-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-stone-500">
                      by {product.entrepreneur?.businessName || 'Local Maker'}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-lg font-bold text-stone-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="text-sm font-bold text-orange-600 hover:text-orange-700"
                      >
                        Buy Now →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-stone-500">No products found matching your filters.</p>
          )}
        </>
      )}
    </div>
  )
}
