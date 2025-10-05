import React from 'react'
import { Navigate } from 'react-router-dom'
import auth from '../services/auth'
import jwtDecode from 'jwt-decode'

export default function ProtectedRoute({ children, roles }){
  const token = auth.getToken()
  if(!token) return <Navigate to="/login" replace />

  if (roles && roles.length) {
    try {
      const decoded = jwtDecode(token)
      const userRole = decoded.role
      if (!roles.includes(userRole)) return <Navigate to="/" replace />
    } catch (e) {
      return <Navigate to="/login" replace />
    }
  }

  return children
}
