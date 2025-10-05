import React, { useState } from 'react'
import api from '../services/api'
import { useParams, useNavigate } from 'react-router-dom'
import auth from '../services/auth'

export default function ResetPassword(){
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setError(null); setMessage(null); setLoading(true)
    if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }
    if (password !== confirm) { setError('Passwords do not match'); setLoading(false); return }
    try{
      const res = await api.put('/auth/resetpassword/' + token, { password })
      const t = res.data?.token
      if (t) { auth.setToken(t); navigate('/'); window.location.reload() }
      else { setMessage('Password reset. Please login.'); navigate('/login') }
    }catch(err){ setError(err.response?.data?.message || 'Could not reset password') }
    finally{ setLoading(false) }
  }

  return (
    <div style={{padding:20}}>
      <h2>Reset Password</h2>
      <form onSubmit={submit} style={{maxWidth:480}}>
        <div style={{marginBottom:8}}>
          <label>New password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
        </div>
        <div style={{marginBottom:8}}>
          <label>Confirm password</label>
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{width:'100%'}} />
        </div>
        {message && <div style={{color:'green', marginBottom:8}}>{message}</div>}
        {error && <div style={{color:'crimson', marginBottom:8}}>{error}</div>}
        <button disabled={loading} type="submit">{loading ? 'Saving...' : 'Set new password'}</button>
      </form>
    </div>
  )
}
