import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const navigate = useNavigate(); const { register } = useAuth()
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'customer', location: '' })
  const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false)
  const change = event => setValues({ ...values, [event.target.name]: event.target.value })
  const submit = async event => {
    event.preventDefault(); setError('')
    if (!values.name || !values.email || !values.password || !values.confirm || !values.role) return setError('Please fill in all required fields.')
    if (!/^\S+@\S+\.\S+$/.test(values.email)) return setError('Please enter a valid email address.')
    if (values.password.length < 6) return setError('Password must be at least 6 characters.')
    if (values.password !== values.confirm) return setError('Passwords do not match.')
    setSubmitting(true)
    try { await register({ name: values.name, email: values.email, phone: values.phone, password: values.password, role: values.role, location: values.location }); navigate('/') }
    catch (requestError) { setError(requestError.message) }
    finally { setSubmitting(false) }
  }
  return <div className="grid min-h-[760px] place-items-center bg-orange-50 px-5 py-14"><div className="w-full max-w-2xl rounded-3xl bg-white p-7 shadow-xl shadow-orange-100 sm:p-10"><p className="font-bold text-orange-600">Hunar<span className="text-stone-900">Hub</span></p><h1 className="display mt-7 text-4xl">Join the hub</h1><p className="mt-2 mb-8 text-stone-500">Create your profile and become part of a community that values local work.</p><form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">{[['name','Full name','text'],['email','Email','email'],['phone','Phone number','tel'],['location','Location','text']].map(([name,label,type]) => <label key={name} className="grid gap-2 text-sm font-bold text-stone-700">{label}<input name={name} type={type} value={values[name]} onChange={change} required={name === 'name' || name === 'email'} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>)}<label className="grid gap-2 text-sm font-bold text-stone-700">Password<input name="password" type="password" value={values.password} onChange={change} required minLength="6" className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label><label className="grid gap-2 text-sm font-bold text-stone-700">Confirm password<input name="confirm" type="password" value={values.confirm} onChange={change} required className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label><fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-bold text-stone-700">I am joining as</legend><div className="flex gap-3">{[['customer','Customer'],['entrepreneur','Entrepreneur']].map(([role,label]) => <label key={role} className={`flex-1 cursor-pointer rounded-xl border p-3 text-center text-sm font-bold ${values.role === role ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-stone-200'}`}><input type="radio" name="role" value={role} checked={values.role === role} onChange={change} className="sr-only" />{label}</label>)}</div></fieldset>{error && <p role="alert" className="rounded-xl bg-orange-50 p-3 text-sm text-orange-700 sm:col-span-2">{error}</p>}<button disabled={submitting} className="rounded-full bg-orange-500 py-3.5 font-bold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">{submitting ? 'Creating account...' : 'Create Account'}</button><p className="text-center text-sm text-stone-500 sm:col-span-2">Already have an account? <Link to="/login" className="font-bold text-orange-600">Login</Link></p></form></div></div>
}
