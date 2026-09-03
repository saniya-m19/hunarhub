import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submit = async event => {
    event.preventDefault(); setError('')
    if (!values.email || !values.password) return setError('Please fill in all required fields.')
    if (!/^\S+@\S+\.\S+$/.test(values.email)) return setError('Please enter a valid email address.')
    setSubmitting(true)
    try { const loggedInUser = await login({ email: values.email, password: values.password }); navigate(`/dashboard/${loggedInUser.role}`) }
    catch (requestError) { setError(requestError.message) }
    finally { setSubmitting(false) }
  }
  return <Auth title="Welcome back" subtitle="Pick up where you left off in your local community."><form onSubmit={submit} className="grid gap-5"><Field label="Email" type="email" value={values.email} onChange={e => setValues({ ...values, email: e.target.value })} /><Field label="Password" type="password" value={values.password} onChange={e => setValues({ ...values, password: e.target.value })} /><label className="flex items-center gap-2 text-sm text-stone-600"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-orange-500" /> Remember me</label>{error && <p role="alert" className="rounded-xl bg-orange-50 p-3 text-sm text-orange-700">{error}</p>}<button disabled={submitting} className="rounded-full bg-orange-500 py-3.5 font-bold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Logging in...' : 'Login'}</button><p className="text-center text-sm text-stone-500">New to HunarHub? <Link to="/register" className="font-bold text-orange-600">Create an account</Link></p></form></Auth>
}
function Field({ label, ...props }) { return <label className="grid gap-2 text-sm font-bold text-stone-700">{label}<input {...props} required className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label> }
function Auth({ title, subtitle, children }) { return <div className="grid min-h-[680px] place-items-center bg-orange-50 px-5 py-16"><div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-orange-100 sm:p-10"><p className="font-bold text-orange-600">Hunar<span className="text-stone-900">Hub</span></p><h1 className="display mt-8 text-4xl">{title}</h1><p className="mt-2 mb-8 text-stone-500">{subtitle}</p>{children}</div></div> }
