import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth()
  if (loading) return <div className="grid min-h-[50vh] place-items-center text-sm font-semibold text-orange-600">Checking your session...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <div className="grid min-h-[55vh] place-items-center px-5 text-center"><div><h1 className="display text-4xl text-stone-900">Unauthorized Access</h1><p className="mt-3 text-stone-500">This workspace is not available for your account.</p><Link to={`/dashboard/${user.role}`} className="mt-6 inline-block rounded-full bg-orange-500 px-5 py-3 font-bold text-white">Return to your dashboard</Link></div></div>
  return children
}
