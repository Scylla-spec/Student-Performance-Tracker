import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TrendingUp, Target, ArrowLeft, Calculator } from 'lucide-react'
import axios from 'axios'

export default function WhatDoINeed() {
  const [target, setTarget] = useState(65)
  const [remainingWeight, setRemainingWeight] = useState(40)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const getUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.sub
    } catch { return null }
  }

  const handleCalculate = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`http://127.0.0.1:8000/analytics/whatdoineed/${getUserId()}`, {
        params: { target, remaining_weight: remainingWeight }
      })
      setResult(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) navigate('/login')
  }, [])

  const degreeTargets = [
    { label: 'Distinction', value: 75, color: 'border-green-500 text-green-400' },
    { label: '2:1 Upper Second', value: 65, color: 'border-blue-500 text-blue-400' },
    { label: '2:2 Lower Second', value: 60, color: 'border-blue-400 text-blue-300' },
    { label: 'Pass', value: 50, color: 'border-orange-500 text-orange-400' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp size={22} className="text-green-400" />
            <span className="font-bold text-white">Performance Tracker</span>
          </div>
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft size={15} />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target size={28} className="text-green-400" />
            <h2 className="text-3xl font-bold text-white">What Do I Need?</h2>
          </div>
          <p className="text-gray-400 text-sm">Select your target degree class and remaining assessment weight — we'll calculate exactly what score you need.</p>
        </div>

        {/* Quick Target Buttons */}
        <div>
          <p className="text-sm text-gray-400 mb-3 font-medium">Select target degree class:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {degreeTargets.map(t => (
              <button key={t.value} onClick={() => setTarget(t.value)}
                className={`border-2 rounded-xl py-3 px-2 text-sm font-bold transition ${target === t.value ? t.color + ' bg-gray-800' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1 font-medium">Target Average (%)</label>
            <input type="number" value={target} onChange={e => setTarget(parseFloat(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1 font-medium">Remaining Assessment Weight (%)</label>
            <p className="text-xs text-gray-500 mb-2">e.g. if you still have a final exam worth 60%, enter 60</p>
            <input type="number" value={remainingWeight} onChange={e => setRemainingWeight(parseFloat(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
          </div>

          <button onClick={handleCalculate} disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
            <Calculator size={18} />
            {loading ? 'Calculating...' : 'Calculate'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl p-6 border-2 ${result.achievable ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
            <p className="text-sm text-gray-400 mb-2 font-medium">Result</p>
            <p className={`text-5xl font-bold ${result.achievable ? 'text-green-400' : 'text-red-400'}`}>
              {result.needed}%
            </p>
            <p className="text-sm mt-3 text-gray-300">{result.message}</p>
            {result.achievable ? (
              <div className="flex items-center gap-2 mt-3">
                <Target size={16} className="text-green-400" />
                <p className="text-green-400 text-sm font-semibold">This is achievable — go get it!</p>
              </div>
            ) : (
              <p className="text-red-400 text-sm mt-2">Focus on the next best degree class instead.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}