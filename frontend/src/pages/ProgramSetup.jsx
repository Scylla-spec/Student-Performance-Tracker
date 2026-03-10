import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Settings, ArrowLeft, Save, CheckCircle } from 'lucide-react'
import axios from 'axios'

export default function ProgramSetup() {
  const [programName, setProgramName] = useState('')
  const [totalSemesters, setTotalSemesters] = useState(4)
  const [weights, setWeights] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const getUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.sub
    } catch { return null }
  }

  useEffect(() => {
    const newWeights = Array.from({ length: totalSemesters }, (_, i) => ({
      semester_number: i + 1,
      weight: parseFloat((100 / totalSemesters).toFixed(2)),
      label: `Semester ${i + 1}`
    }))
    setWeights(newWeights)
  }, [totalSemesters])

  useEffect(() => {
    if (!token) navigate('/login')
    const loadProgram = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/programs/${getUserId()}`)
        if (res.data.program) {
          setProgramName(res.data.program.program_name)
          setTotalSemesters(res.data.program.total_semesters)
          setWeights(res.data.semester_weights.map(sw => ({
            semester_number: sw.semester_number,
            weight: sw.weight,
            label: sw.label
          })))
        }
      } catch (err) { console.error(err) }
    }
    loadProgram()
  }, [])

  const totalWeight = weights.reduce((sum, w) => sum + parseFloat(w.weight || 0), 0)

  const handleWeightChange = (index, value) => {
    const updated = [...weights]
    updated[index].weight = parseFloat(value) || 0
    setWeights(updated)
  }

  const handleLabelChange = (index, value) => {
    const updated = [...weights]
    updated[index].label = value
    setWeights(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Math.round(totalWeight) !== 100) {
      setError('Semester weights must add up to exactly 100%!')
      return
    }
    setLoading(true)
    setError('')
    try {
      await axios.post('http://127.0.0.1:8000/programs/', {
        user_id: getUserId(),
        program_name: programName,
        total_semesters: totalSemesters,
        semester_weights: weights
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp size={22} className="text-green-400" />
            <span className="font-bold text-white">Performance Tracker</span>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft size={15} />
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Settings size={28} className="text-green-400" />
            <h2 className="text-3xl font-bold text-white">Program Setup</h2>
          </div>
          <p className="text-gray-400 text-sm">Configure your degree program and how much each semester contributes to your final degree class.</p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/40 border border-green-500 text-green-400 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            Program saved! Redirecting to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Program Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <p className="text-white font-semibold text-sm uppercase tracking-wide">Program Information</p>
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">Program Name</label>
              <input type="text" value={programName} onChange={e => setProgramName(e.target.value)}
                placeholder="e.g. BSc Computer Science" required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1 font-medium">Total Semesters</label>
              <select value={totalSemesters} onChange={e => setTotalSemesters(parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition">
                {[2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>{n} Semesters</option>
                ))}
              </select>
            </div>
          </div>

          {/* Semester Weights */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-white font-semibold text-sm uppercase tracking-wide">Semester Weights</p>
              <div className={`flex items-center gap-1.5 text-sm font-bold ${Math.round(totalWeight) === 100 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.round(totalWeight) === 100 && <CheckCircle size={14} />}
                Total: {totalWeight.toFixed(1)}%
                {Math.round(totalWeight) !== 100 && <span className="text-xs font-normal text-gray-500 ml-1">(must be 100%)</span>}
              </div>
            </div>
            <p className="text-gray-500 text-xs">Set how much each semester contributes to your final degree.</p>

            <div className="space-y-3">
              {weights.map((w, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-center">
                  <input type="text" value={w.label} onChange={e => handleLabelChange(i, e.target.value)}
                    placeholder={`Semester ${w.semester_number}`}
                    className="col-span-2 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition" />
                  <div className="relative">
                    <input type="number" value={w.weight} onChange={e => handleWeightChange(i, e.target.value)}
                      min="0" max="100"
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition pr-8" />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || Math.round(totalWeight) !== 100}
            className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Program Setup'}
          </button>
        </form>
      </div>
    </div>
  )
}