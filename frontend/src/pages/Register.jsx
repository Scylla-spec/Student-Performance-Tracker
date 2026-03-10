import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Hash, UserPlus, TrendingUp } from 'lucide-react'
import axios from 'axios'

export default function Register() {
    const [form, setForm] = useState({ student_id: '', full_name: '', email: '', password: '' })
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
            await axios.post('http://127.0.0.1:8000/auth/register', form)
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed')
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
                        <h1 className="text-2xl font-bold text-white">Create account</h1>
                        <p className="text-gray-400 mt-1 text-sm">Start tracking your academic performance.</p>
                    </div>

                    {error && (
                        <div className="bg-red-900/40 border border-red-500 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Student ID</label>
                            <div className="relative">
                                <Hash size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input type="text" name="student_id" value={form.student_id} onChange={handleChange} required
                                    placeholder="e.g. C223456Y"
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-3.5 text-gray-500" />
                                <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required
                                    placeholder="Your full name"
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
                            </div>
                        </div>

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
                            <UserPlus size={18} />
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-green-400 hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}