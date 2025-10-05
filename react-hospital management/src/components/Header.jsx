import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import auth from '../services/auth'
import jwtDecode from 'jwt-decode'

export default function Header(){
  const navigate = useNavigate()
  const token = auth.getToken()
  let role = null
  let username = null
  try { if (token) { const decoded = jwtDecode(token); role = decoded.role; const user = auth.getUser(); username = user?.username } } catch (e) { role = null }

  const handleLogout = () => {
    auth.clearToken()
    auth.clearUser()
    navigate('/login')
    // reload to ensure pages that read token re-evaluate
    window.location.reload()
  }

  const [dark, setDark] = React.useState(()=> localStorage.getItem('pc_theme') === 'dark')
  React.useEffect(()=>{ document.body.classList.toggle('dark', dark); localStorage.setItem('pc_theme', dark ? 'dark' : 'light') },[dark])

  return (
    <header className="app-header">
      <div className="container">
        <div className="brand">
          <img src="/logo.svg" alt="logo" />
          <h1>PulseCare Admin</h1>
        </div>
        <nav>
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/patients">Patients</Link>
          <Link className="nav-link" to="/appointments">Appointments</Link>
          <Link className="nav-link" to="/inventory">Inventory</Link>
          <span className="auth-buttons">
          {token ? (
            <>
              <span className="user-badge">{username ? username : (role ? role.toUpperCase() : 'USER')}</span>
              <button onClick={handleLogout} className="btn btn-outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
          </span>

          <div className="nav-right-spacer" />

          {/* Theme toggle moved to the far right */}
          <button onClick={()=>setDark(d=>!d)} className="btn btn-icon theme-toggle" aria-label="Toggle theme">
            {/* Moon / Sun SVG */}
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.76 4.84l-1.8-1.79L3.17 4.83l1.79 1.79 1.8-1.78zM1 13h3v-2H1v2zm10 9h2v-3h-2v3zm7.03-2.77l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79zM20 11v2h3v-2h-3zM6.76 19.16l1.8 1.79 1.79-1.79-1.79-1.79-1.8 1.79zM12 5a7 7 0 100 14 7 7 0 000-14z" fill="currentColor"/></svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
