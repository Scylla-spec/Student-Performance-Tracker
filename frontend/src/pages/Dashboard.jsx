import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Dashboard() {
    const [modules, setModules] = useState([])
    const [projection, setProjection] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showAddModule, setShowAddModule] = useState(false)
    const [selectedModule, setSelectedModule] = useState(null)
    const [marks, setMarks] = useState([])
    const [moduleForm, setModuleForm] = useState({
        module_code: '', module_name: '', credit_hours: 3,
        semester: 1, phase: 1, academic_year: '2026'
    })
    const [markForm, setMarkForm] = useState({
        assessment_type: '', score: '', max_score: '', weight: ''
    })
    const navigate = useNavigate()
    const fullName = localStorage.getItem('full_name')
    const token = localStorage.getItem('token')

    const getUserId = () => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            return payload.sub
        } catch { return null }
    }
    const userId = getUserId()

    const fetchData = async () => {
        try {
            const [modRes, projRes] = await Promise.all([
                axios.get(`http://127.0.0.1:8000/modules/${userId}`),
                axios.get(`http://127.0.0.1:8000/analytics/projection/${userId}`)
            ])
            setModules(modRes.data.data || [])
            setProjection(projRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMarks = async (moduleId) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/marks/${moduleId}`)
            setMarks(res.data.data || [])
        } catch (err) { console.error(err) }
    }

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        fetchData()
    }, [])

    const handleAddModule = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://127.0.0.1:8000/modules/', {
                ...moduleForm,
                user_id: userId,
                credit_hours: parseInt(moduleForm.credit_hours),
                semester: parseInt(moduleForm.semester),
                phase: parseInt(moduleForm.phase)
            })
            setShowAddModule(false)
            setModuleForm({ module_code: '', module_name: '', credit_hours: 3, semester: 1, phase: 1, academic_year: '2026' })
            fetchData()
        } catch (err) { console.error(err) }
    }

    const handleAddMark = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://127.0.0.1:8000/marks/', {
                module_id: selectedModule.id,
                assessment_type: markForm.assessment_type,
                score: parseFloat(markForm.score),
                max_score: parseFloat(markForm.max_score),
                weight: parseFloat(markForm.weight)
            })
            setMarkForm({ assessment_type: '', score: '', max_score: '', weight: '' })
            fetchMarks(selectedModule.id)
            fetchData()
        } catch (err) { console.error(err) }
    }

    const openModule = (mod) => {
        setSelectedModule(mod)
        fetchMarks(mod.id)
    }

    const degreeColor = {
        green: 'text-green-400',
        blue: 'text-blue-400',
        orange: 'text-orange-400',
        red: 'text-red-400'
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <p className="text-green-400 text-lg animate-pulse">Loading your performance data...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navbar */}
            <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
                <h1 className="text-green-400 font-bold text-lg">📊 Performance Tracker</h1>
                <div className="flex items-center gap-4">
                    <Link to="/whatdoineed" className="text-sm text-green-400 hover:text-green-300 transition">🎯 What Do I Need?</Link>
                    <span className="text-gray-400 text-sm">Hey, {fullName} 👋</span>
                    <button onClick={() => { localStorage.clear(); navigate('/login') }} className="text-sm text-red-400 hover:text-red-300">Logout</button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

                {/* Degree Projection */}
                {projection?.projection && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm mb-1">Current Degree Projection</p>
                        <h2 className={`text-4xl font-bold ${degreeColor[projection.projection.color]}`}>
                            {projection.projection.class}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Overall Average: <span className="text-white font-semibold">{projection.overall_average}%</span></p>
                        <p className={`text-sm mt-3 ${degreeColor[projection.projection.color]}`}>{projection.projection.message}</p>
                    </div>
                )}

                {/* Modules */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Your Modules</h3>
                        <button onClick={() => setShowAddModule(!showAddModule)}
                            className="bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-4 py-2 rounded-lg text-sm transition">
                            + Add Module
                        </button>
                    </div>

                    {showAddModule && (
                        <form onSubmit={handleAddModule} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4 grid grid-cols-2 gap-4">
                            {[
                                { name: 'module_code', placeholder: 'e.g. SCS2211', label: 'Module Code' },
                                { name: 'module_name', placeholder: 'e.g. Software Project Mgmt', label: 'Module Name' },
                                { name: 'academic_year', placeholder: 'e.g. 2026', label: 'Academic Year' },
                                { name: 'credit_hours', placeholder: '3', label: 'Credit Hours', type: 'number' },
                                { name: 'semester', placeholder: '1', label: 'Semester', type: 'number' },
                                { name: 'phase', placeholder: '1 or 2', label: 'Phase', type: 'number' },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-xs text-gray-400 mb-1">{field.label}</label>
                                    <input type={field.type || 'text'} name={field.name} value={moduleForm[field.name]}
                                        onChange={e => setModuleForm({ ...moduleForm, [e.target.name]: e.target.value })}
                                        placeholder={field.placeholder} required
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                                </div>
                            ))}
                            <div className="col-span-2">
                                <button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-2 rounded-lg text-sm">Save Module</button>
                            </div>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {modules.map(mod => {
                            const modProjection = projection?.modules?.find(m => m.module_code === mod.module_code)
                            return (
                                <div key={mod.id} onClick={() => openModule(mod)}
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-green-500 transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-green-400 font-bold text-sm">{mod.module_code}</p>
                                            <p className="text-white font-semibold">{mod.module_name}</p>
                                        </div>
                                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">Phase {mod.phase}</span>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-2">Semester {mod.semester} · {mod.academic_year} · {mod.credit_hours} credits</p>
                                    {modProjection && (
                                        <p className={`text-sm font-bold mt-2 ${degreeColor[modProjection.degree_class.color]}`}>
                                            {modProjection.average}% — {modProjection.degree_class.class}
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Module Marks Modal */}
            {selectedModule && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-green-400 font-bold">{selectedModule.module_code}</p>
                                <p className="text-white font-semibold">{selectedModule.module_name}</p>
                            </div>
                            <button onClick={() => setSelectedModule(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
                        </div>

                        {marks.length > 0 && (
                            <div className="mb-4 space-y-2">
                                <p className="text-gray-400 text-xs uppercase tracking-wide">Recorded Marks</p>
                                {marks.map(m => (
                                    <div key={m.id} className="bg-gray-800 rounded-lg px-4 py-2 flex justify-between items-center">
                                        <span className="text-sm text-gray-300">{m.assessment_type}</span>
                                        <span className="text-sm font-bold text-white">{m.score}/{m.max_score} <span className="text-gray-400 text-xs">({m.weight}% weight)</span></span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleAddMark} className="space-y-3">
                            <p className="text-gray-400 text-xs uppercase tracking-wide">Add Assessment</p>
                            <input type="text" placeholder="Assessment type (e.g. Test 1, Assignment)"
                                value={markForm.assessment_type}
                                onChange={e => setMarkForm({ ...markForm, assessment_type: e.target.value })}
                                required className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs text-gray-400">Score</label>
                                    <input type="number" placeholder="65" value={markForm.score}
                                        onChange={e => setMarkForm({ ...markForm, score: e.target.value })}
                                        required className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Out of</label>
                                    <input type="number" placeholder="100" value={markForm.max_score}
                                        onChange={e => setMarkForm({ ...markForm, max_score: e.target.value })}
                                        required className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Weight %</label>
                                    <input type="number" placeholder="30" value={markForm.weight}
                                        onChange={e => setMarkForm({ ...markForm, weight: e.target.value })}
                                        required className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-2 rounded-lg text-sm transition">
                                + Add Mark
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}