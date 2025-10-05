import React, { useState } from 'react'
import api from '../services/api'
import auth from '../services/auth'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try{
      const res = await api.post('/auth/login', { email, password })
      const token = res.data.token
      if(token){
        auth.setToken(token)
        // Save user info if provided
        if (res.data?.data) auth.setUser(res.data.data)
        navigate('/')
        window.location.reload()
      } else {
        setError('No token received')
      }
    }catch(err){
      setError(err.response?.data?.message || err.message)
    }finally{ setLoading(false) }
  }

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{maxWidth:360}}>
        <div style={{marginBottom:8}}>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
        </div>
        <div style={{marginBottom:8}}>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
        </div>
        {error && <div style={{color:'crimson', marginBottom:8}}>{error}</div>}
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button disabled={loading} type="submit">{loading ? 'Logging in...' : 'Login'}</button>
          <a href="/forgot-password" style={{fontSize:13}}>Forgot password?</a>
        </div>
      </form>
    </div>
  )
}
