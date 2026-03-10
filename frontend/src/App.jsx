import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import WhatDoINeed from './pages/WhatDoINeed'
import ProgramSetup from './pages/ProgramSetup'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/whatdoineed" element={<WhatDoINeed />} />
      <Route path="/program-setup" element={<ProgramSetup />} />
    </Routes>
  )
}

export default App