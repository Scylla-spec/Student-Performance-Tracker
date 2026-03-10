import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, LogIn, TrendingUp } from 'lucide-react'
import axios from 'axios'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('http://127.0.0.1:8000/auth/login', form)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('full_name', res.data.full_name)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <TrendingUp size={32} className="text-green-400" />
          <span className="text-white font-bold text-xl tracking-tight">Performance Tracker</span>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 mt-1 text-sm">Track your performance. Own your degree.</p>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-500 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-gray-500" />
                <input type="email" name="email" value={form.email} onChange={handleChange} required
                  placeholder="you@university.ac.zw"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-gray-500" />
                <input type="password" name="password" value={form.password} onChange={handleChange} required
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
              <LogIn size={18} />
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-400 hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}