import React, { useState } from 'react'
import api from '../services/api'
import auth from '../services/auth'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try{
      const res = await api.post('/auth/register', { username, email, password })
      // If backend returns token on register, use it; otherwise require login
      const token = res.data?.token
      if (token) {
        auth.setToken(token)
        if (res.data?.data) auth.setUser(res.data.data)
        navigate('/')
        window.location.reload()
      } else {
        // fallback to login page
        navigate('/login')
      }
    }catch(err){
      // Show backend-provided message when possible
      const msg = err?.response?.data?.message || err?.message || 'Registration failed.'
      setError(msg)
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Register</h2>
      <form onSubmit={submit} style={{maxWidth:360}}>
        <div style={{marginBottom:8}}>
          <label>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} style={{width:'100%'}} />
        </div>
        <div style={{marginBottom:8}}>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
        </div>
        <div style={{marginBottom:8}}>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
        </div>
        {/* Public registration creates a Patient account by default; staff/admin accounts must be created by an admin. */}
        {error && <div style={{color:'crimson', marginBottom:8}}>{error}</div>}
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
