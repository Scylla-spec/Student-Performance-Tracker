import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TrendingUp, Plus, X, BookOpen, Settings, Target, LogOut, ChevronRight } from 'lucide-react'
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

    const degreeBorder = {
        green: 'border-green-500',
        blue: 'border-blue-500',
        orange: 'border-orange-500',
        red: 'border-red-500'
    }

    const degreeBg = {
        green: 'bg-green-900/20',
        blue: 'bg-blue-900/20',
        orange: 'bg-orange-900/20',
        red: 'bg-red-900/20'
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="flex items-center gap-3 text-green-400">
                <TrendingUp size={24} className="animate-pulse" />
                <p className="text-lg">Loading your performance data...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navbar */}
            <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={22} className="text-green-400" />
                        <span className="font-bold text-white">Performance Tracker</span>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link to="/whatdoineed" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition">
                            <Target size={15} />
                            What Do I Need?
                        </Link>
                        <Link to="/program-setup" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition">
                            <Settings size={15} />
                            Program Setup
                        </Link>
                        <span className="text-gray-600">|</span>
                        <span className="text-sm text-gray-400">Hey, {fullName}</span>
                        <button onClick={() => { localStorage.clear(); navigate('/login') }}
                            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition">
                            <LogOut size={15} />
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

                {/* Degree Projection Card */}
                {projection?.projection ? (
                    <div className={`rounded-2xl p-6 border ${degreeBorder[projection.projection.color]} ${degreeBg[projection.projection.color]}`}>
                        <p className="text-gray-400 text-sm mb-1">Current Degree Projection</p>
                        <div className="flex items-end gap-4">
                            <h2 className={`text-4xl font-bold ${degreeColor[projection.projection.color]}`}>
                                {projection.projection.class}
                            </h2>
                            <span className="text-gray-400 text-lg mb-1">{projection.overall_average}%</span>
                        </div>
                        <p className={`text-sm mt-3 ${degreeColor[projection.projection.color]}`}>
                            {projection.projection.message}
                        </p>
                        {projection.using_program_weights && (
                            <p className="text-xs text-gray-500 mt-2">Calculated using your program semester weights</p>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                        <BookOpen size={32} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No modules yet. Add your first module to start tracking!</p>
                    </div>
                )}

                {/* Modules Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Your Modules</h3>
                        <button onClick={() => setShowAddModule(!showAddModule)}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-gray-950 font-bold px-4 py-2 rounded-lg text-sm transition">
                            <Plus size={16} />
                            Add Module
                        </button>
                    </div>

                    {/* Add Module Form */}
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
                                <button type="submit"
                                    className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                                    <Plus size={16} /> Save Module
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Module Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {modules.map(mod => {
                            const modProjection = projection?.modules?.find(m => m.module_code === mod.module_code)
                            return (
                                <div key={mod.id} onClick={() => openModule(mod)}
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-green-500 transition group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-green-400 font-bold text-sm">{mod.module_code}</p>
                                            <p className="text-white font-semibold mt-0.5">{mod.module_name}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                                                Phase {mod.phase}
                                            </span>
                                            <ChevronRight size={16} className="text-gray-600 group-hover:text-green-400 transition" />
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-2">
                                        Semester {mod.semester} · {mod.academic_year} · {mod.credit_hours} credits
                                    </p>
                                    {modProjection && modProjection.average > 0 && (
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className={`text-sm font-bold ${degreeColor[modProjection.degree_class.color]}`}>
                                                {modProjection.average}%
                                            </span>
                                            <span className="text-gray-600 text-xs">—</span>
                                            <span className={`text-xs font-medium ${degreeColor[modProjection.degree_class.color]}`}>
                                                {modProjection.degree_class.class}
                                            </span>
                                        </div>
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
                                <p className="text-green-400 font-bold text-sm">{selectedModule.module_code}</p>
                                <p className="text-white font-semibold">{selectedModule.module_name}</p>
                            </div>
                            <button onClick={() => setSelectedModule(null)}
                                className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-800">
                                <X size={20} />
                            </button>
                        </div>

                        {marks.length > 0 && (
                            <div className="mb-4 space-y-2">
                                <p className="text-gray-400 text-xs uppercase tracking-wide font-medium">Recorded Marks</p>
                                {marks.map(m => (
                                    <div key={m.id} className="bg-gray-800 rounded-lg px-4 py-3 flex justify-between items-center">
                                        <span className="text-sm text-gray-300">{m.assessment_type}</span>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-white">{m.score}/{m.max_score}</span>
                                            <span className="text-gray-500 text-xs ml-2">({m.weight}% weight)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleAddMark} className="space-y-3">
                            <p className="text-gray-400 text-xs uppercase tracking-wide font-medium">Add Assessment</p>
                            <input type="text" placeholder="Assessment type (e.g. Test 1, Assignment)"
                                value={markForm.assessment_type}
                                onChange={e => setMarkForm({ ...markForm, assessment_type: e.target.value })}
                                required className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { key: 'score', label: 'Score', placeholder: '65' },
                                    { key: 'max_score', label: 'Out of', placeholder: '100' },
                                    { key: 'weight', label: 'Weight %', placeholder: '30' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="text-xs text-gray-400">{field.label}</label>
                                        <input type="number" placeholder={field.placeholder}
                                            value={markForm[field.key]}
                                            onChange={e => setMarkForm({ ...markForm, [field.key]: e.target.value })}
                                            required className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                                    </div>
                                ))}
                            </div>
                            <button type="submit"
                                className="w-full bg-green-500 hover:bg-green-400 text-gray-950 font-bold py-2 rounded-lg text-sm transition flex items-center justify-center gap-2">
                                <Plus size={16} /> Add Mark
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}