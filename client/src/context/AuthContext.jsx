import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('hunarhub_user')) } catch { return null } })
  const [token, setToken] = useState(() => authService.getToken())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    authService.getCurrentUser().then(result => {
      const currentUser = result.data.user
      localStorage.setItem('hunarhub_user', JSON.stringify(currentUser))
      setUser(currentUser)
    }).catch(() => { authService.clearAuthStorage(); setToken(null); setUser(null) }).finally(() => setLoading(false))
  }, [token])

  const saveSession = result => { const nextToken = result.token; const nextUser = result.data.user; authService.setToken(nextToken); localStorage.setItem('hunarhub_user', JSON.stringify(nextUser)); setToken(nextToken); setUser(nextUser); return nextUser }
  const login = async credentials => saveSession(await authService.login(credentials))
  const register = async userData => saveSession(await authService.register(userData))
  const logout = async () => { try { await authService.logout() } finally { authService.clearAuthStorage(); setToken(null); setUser(null) } }

  return <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(user && token), loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
