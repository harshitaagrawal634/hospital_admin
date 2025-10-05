import React, { useEffect, useState } from 'react'
import api from '../services/api'
import auth from '../services/auth'

export default function Appointments(){
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState(null)
  const [requests, setRequests] = useState([])

  useEffect(()=>{
    api.get('/requests/doctors').then(r=>setDoctors(r.data.doctors)).catch(()=>{})
    api.get('/requests/appointments').then(r=>setRequests(r.data.requests)).catch(()=>{})
  },[])

  const submit = async (e) =>{
    e.preventDefault(); setMessage(null)
    try{
      await api.post('/requests/appointments', { doctorId: selectedDoctor, appointmentDate: date, appointmentTime: time, reason })
      setMessage('Appointment requested — staff will confirm')
      const r = await api.get('/requests/appointments'); setRequests(r.data.requests)
    }catch(err){ setMessage(err.response?.data?.message || err.message) }
  }

  return (
    <div style={{padding:20}}>
      <h2>Book an Appointment</h2>
      <form onSubmit={submit} style={{maxWidth:480}}>
        <div style={{marginBottom:8}}>
          <label>Doctor</label>
          <select value={selectedDoctor} onChange={e=>setSelectedDoctor(e.target.value)} style={{width:'100%'}}>
            <option value="">-- choose doctor --</option>
            {doctors.map(d=> <option key={d._id} value={d._id}>{d.username} — {d.email}</option>)}
          </select>
        </div>
        <div style={{display:'flex',gap:8}}>
          <div style={{flex:1}}>
            <label>Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%'}} />
          </div>
          <div style={{width:140}}>
            <label>Time</label>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{width:'100%'}} />
          </div>
        </div>
        <div>
          <label>Reason</label>
          <input value={reason} onChange={e=>setReason(e.target.value)} style={{width:'100%'}} />
        </div>
        {message && <div style={{marginTop:8,color:'var(--accent-dark)'}}>{message}</div>}
        <div style={{marginTop:12}}>
          <button className="btn btn-primary" type="submit">Request Appointment</button>
        </div>
      </form>

      <h3 style={{marginTop:24}}>Your Requests</h3>
      <ul>
        {requests.map(r=> (
          <li key={r._id}>{r.doctor.username} — {new Date(r.appointmentDate).toLocaleDateString()} {r.appointmentTime} — {r.status}</li>
        ))}
      </ul>
    </div>
  )
}
