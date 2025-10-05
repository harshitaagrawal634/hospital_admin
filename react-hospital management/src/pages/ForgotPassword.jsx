import React, { useState } from 'react'
import api from '../services/api'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setError(null); setMessage(null); setLoading(true)
    try{
      await api.post('/auth/forgotpassword', { email })
      setMessage('If an account exists for that email, a reset link has been sent. Check your inbox.')
    }catch(err){
      setError(err.response?.data?.message || 'Could not request password reset')
    }finally{ setLoading(false) }
  }

  return (
    <div style={{padding:20}}>
      <h2>Forgot password</h2>
      <form onSubmit={submit} style={{maxWidth:480}}>
        <div style={{marginBottom:8}}>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
        </div>
        {message && <div style={{color:'green', marginBottom:8}}>{message}</div>}
        {error && <div style={{color:'crimson', marginBottom:8}}>{error}</div>}
        <button disabled={loading} type="submit">{loading ? 'Sending...' : 'Send reset link'}</button>
      </form>
    </div>
  )
}
