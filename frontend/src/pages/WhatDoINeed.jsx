import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function WhatDoINeed() {
    const [target, setTarget] = useState(60)
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
        { label: 'First Class', value: 70, color: 'border-green-500 text-green-400' },
        { label: '2:1 Upper Second', value: 60, color: 'border-blue-500 text-blue-400' },
        { label: '2:2 Lower Second', value: 50, color: 'border-orange-500 text-orange-400' },
    ]

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navbar */}
            <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
                <h1 className="text-green-400 font-bold text-lg">📊 Performance Tracker</h1>
                <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition">← Back to Dashboard</Link>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">What Do I Need? 🎯</h2>
                    <p className="text-gray-400 mt-2">Enter your target degree class and remaining assessment weight — we'll tell you exactly what score you need.</p>
                </div>

                {/* Quick Target Buttons */}
                <div>
                    <p className="text-sm text-gray-400 mb-3">Select target degree class:</p>
                    <div className="grid grid-cols-3 gap-3">
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
                        <label className="block text-sm text-gray-400 mb-1">Target Average (%)</label>
                        <input type="number" value={target} onChange={e => setTarget(parseFloat(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Remaining Assessment Weight (%)</label>
                        <p className="text-xs text-gray-500 mb-2">e.g. if you still have a final exam worth 60%, enter 60</p>
                        <input type="number" value={remainingWeight} onChange={e => setRemainingWeight(parseFloat(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
                    </div>

                    <button onClick={handleCalculate} disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-3 rounded-lg transition disabled:opacity-50">
                        {loading ? 'Calculating...' : 'Calculate'}
                    </button>
                </div>

                {/* Result */}
                {result && (
                    <div className={`rounded-2xl p-6 border-2 ${result.achievable ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                        <p className="text-sm text-gray-400 mb-2">Result</p>
                        <p className={`text-4xl font-bold ${result.achievable ? 'text-green-400' : 'text-red-400'}`}>
                            {result.needed}%
                        </p>
                        <p className="text-sm mt-3 text-gray-300">{result.message}</p>
                        {result.achievable && result.needed <= 70 && (
                            <p className="text-green-400 text-sm mt-2 font-semibold">✅ This is achievable — go get it! 💪</p>
                        )}
                        {!result.achievable && (
                            <p className="text-red-400 text-sm mt-2">Focus on the next best degree class instead.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}