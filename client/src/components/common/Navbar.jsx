import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { FiMenu, FiX, FiCompass, FiArrowUpRight } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = async () => { await logout(); setOpen(false); navigate('/') }
  const links = [['Home','/'],['Find Talent','/entrepreneurs'],['Marketplace','/products']]
  return <header className="sticky top-0 z-30 border-b border-orange-100 bg-[#fffaf3]/95 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-stone-900"><span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-white"><FiCompass /></span><span>Hunar<span className="text-orange-500">Hub</span></span></Link>
      <nav className="hidden items-center gap-8 md:flex">{links.map(([label,to]) => <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => `text-sm font-semibold ${isActive ? 'text-orange-600' : 'text-stone-500 hover:text-orange-600'}`}>{label}</NavLink>)}</nav>
      <div className="hidden items-center gap-3 md:flex">{isAuthenticated ? <><Link to={`/dashboard/${user.role}`} className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">Dashboard</Link><Link to={`/dashboard/${user.role}`} className="text-right"><strong className="block text-sm text-stone-900">{user.name}</strong><span className="text-xs capitalize text-stone-500">{user.role}</span></Link><button onClick={handleLogout} className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-orange-500 hover:text-orange-600">Logout</button></> : <><Link to="/login" className="px-3 py-2 text-sm font-semibold text-stone-700 hover:text-orange-600">Login</Link><Link to="/register" className="flex items-center gap-1 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">Join HunarHub <FiArrowUpRight /></Link></>}</div>
      <button className="text-2xl md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <FiX /> : <FiMenu />}</button>
    </div>
    {open && <nav className="border-t border-orange-100 bg-[#fffaf3] px-5 py-4 md:hidden">{links.map(([label,to]) => <NavLink onClick={() => setOpen(false)} key={to} to={to} end={to === '/'} className="block border-b border-orange-100 py-3 font-semibold">{label}</NavLink>)}{isAuthenticated ? <><Link to={`/dashboard/${user.role}`} onClick={() => setOpen(false)} className="block border-b border-orange-100 py-3 font-semibold">Dashboard</Link><Link to={`/dashboard/${user.role}`} onClick={() => setOpen(false)} className="block py-3 font-semibold">{user.name} <span className="ml-1 text-xs capitalize text-stone-500">({user.role})</span></Link><button onClick={handleLogout} className="w-full rounded-full border border-stone-200 px-4 py-3 text-left font-semibold">Logout</button></> : <><Link to="/login" onClick={() => setOpen(false)} className="block py-3 font-semibold">Login</Link><Link to="/register" onClick={() => setOpen(false)} className="block rounded-full bg-orange-500 px-4 py-3 text-center font-semibold text-white">Join HunarHub</Link></>}</nav>}
  </header>
}
