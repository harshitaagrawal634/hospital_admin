import React, {useEffect, useState} from 'react'
import api from '../services/api'

export default function Patients(){
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    let mounted = true
    api.get('/patients')
      .then(res=>{ if(mounted) setPatients(res.data.patients || res.data || []) })
      .catch(()=>{
        // If protected request fails (no auth/CORS), try public demo endpoint on backend
        api.get('/demo/patients')
          .then(r=>{ if(mounted) setPatients(r.data.patients || []) })
          .catch(()=>{})
      })
      .finally(()=>{ if(mounted) setLoading(false) })
    return ()=> mounted = false
  },[])

  return (
    <div>
      <h2>Patients</h2>
      {loading ? <p>Loading...</p> : (
        patients.length ? (
          <ul>{patients.map(p=> <li key={p._id || p.id}>{p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || 'Unnamed'}</li>)}</ul>
        ) : <p>No patients yet.</p>
      )}
    </div>
  )
}
