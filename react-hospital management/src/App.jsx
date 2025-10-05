import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Patients from './pages/Patients'
import Appointments from './pages/Appointments'
import Inventory from './pages/Inventory'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'

export default function App(){
  return (
    <div>
      <Header />

      <main style={{padding:20}}>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/patients" element={<ProtectedRoute><Patients/></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments/></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory/></ProtectedRoute>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/reset-password/:token" element={<ResetPassword/>} />
        </Routes>
      </main>
    </div>
  )
}
