const API_URL = import.meta.env.VITE_API_URL
if (!API_URL) throw new Error('VITE_API_URL is not configured')

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('hunarhub_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Something went wrong. Please try again.')
  return body
}

export const dashboardApi = (path, options) => apiRequest(`/dashboard${path}`, options)
export const dashboardMutation = (path, method, body) => apiRequest(`/dashboard${path}`, { method, body: JSON.stringify(body) })

export { API_URL }
