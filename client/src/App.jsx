import { Navigate, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/public/Home'
import BrowseEntrepreneurs from './pages/public/BrowseEntrepreneurs'
import Products from './pages/public/Products'
import EntrepreneurProfile from './pages/public/EntrepreneurProfile'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import OrderDetails from './pages/OrderDetails'
import ProtectedRoute from './components/common/ProtectedRoute'
import Dashboard from './pages/dashboard/Dashboard'
import { useAuth } from './context/AuthContext'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/entrepreneurs" element={<BrowseEntrepreneurs />} />
          <Route path="/entrepreneurs/:id" element={<EntrepreneurProfile />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute allowedRoles={['customer']}><OrderSuccess /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['customer']}><OrderDetails /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountRedirect /></ProtectedRoute>} />
          <Route path="/dashboard/customer/*" element={<ProtectedRoute allowedRoles={['customer']}><Dashboard role="customer" /></ProtectedRoute>} />
          <Route path="/dashboard/entrepreneur/*" element={<ProtectedRoute allowedRoles={['entrepreneur']}><Dashboard role="entrepreneur" /></ProtectedRoute>} />
          <Route path="/dashboard/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard role="admin" /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

function AccountRedirect() {
  const { user } = useAuth()
  return <Navigate to={`/dashboard/${user.role}`} replace />
}
