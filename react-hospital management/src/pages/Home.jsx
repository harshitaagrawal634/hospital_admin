import React, { useEffect, useState } from 'react'
import api from '../services/api'
import auth from '../services/auth'
import jwtDecode from 'jwt-decode'

export default function Home(){
  const [counts, setCounts] = useState({ patients: 0, appointments: 0, inventory: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    let mounted = true

    const fetchCounts = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = auth.getToken()
        let userRole = null
        let userId = null
        try { if (token) { const decoded = jwtDecode(token); userRole = decoded.role; userId = decoded.id || decoded._id } } catch(e){}

        if (userRole === 'patient') {
          // Patient: only fetch their appointments and booked inventory (protected endpoints may vary)
          const [aRes] = await Promise.all([
            api.get('/appointments?patientId=' + (userId || ''))
          ])
          if (!mounted) return
          setCounts({ patients: 1, appointments: aRes?.data?.count ?? 0, inventory: 0 })
        } else {
          // Admin/Doctor/Nurse: show global counts
          const [pRes, aRes, iRes] = await Promise.all([
            api.get('/patients'),
            api.get('/appointments'),
            api.get('/inventory'),
          ])
          if (!mounted) return
          setCounts({
            patients: pRes?.data?.count ?? 0,
            appointments: aRes?.data?.count ?? 0,
            inventory: iRes?.data?.count ?? 0,
          })
        }

        setLastUpdated(new Date())
      } catch (err) {
        console.error('Error fetching dashboard counts', err)
        if (!mounted) return
        setError(err?.response?.data?.message || err.message || 'Failed to load data')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCounts()

    return () => { mounted = false }
  }, [])

  return (
    <div className="page">
      <h1>Hospital Management Dashboard</h1>
      <p>Welcome — quick overview of the system.</p>

      {loading && <p>Loading dashboard...</p>}

      {error && (
        <div className="error"><strong>Error:</strong> {error}</div>
      )}

      <div className="cards">
        <div className="card">
          <h3>Patients</h3>
          <div className="big">{counts.patients}</div>
          <div className="muted">Total registered patients</div>
        </div>

        <div className="card">
          <h3>Appointments</h3>
          <div className="big">{counts.appointments}</div>
          <div className="muted">Scheduled appointments</div>
        </div>

        <div className="card">
          <h3>Inventory Items</h3>
          <div className="big">{counts.inventory}</div>
          <div className="muted">Tracked inventory items</div>
        </div>
      </div>

      {lastUpdated && (
        <div style={{ marginTop: 12, color: '#444' }}>
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  )
}
