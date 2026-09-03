import { apiRequest } from './api'

const tokenKey = 'hunarhub_token'

export function getToken() { return localStorage.getItem(tokenKey) }
export function setToken(token) { localStorage.setItem(tokenKey, token) }
export function clearAuthStorage() { localStorage.removeItem(tokenKey); localStorage.removeItem('hunarhub_user') }

export async function register(userData) {
  return apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) })
}

export async function login(credentials) {
  return apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
}

export async function getCurrentUser() {
  return apiRequest('/auth/me', { headers: { Authorization: `Bearer ${getToken()}` } })
}

export async function logout() {
  const token = getToken()
  if (token) await apiRequest('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
}
