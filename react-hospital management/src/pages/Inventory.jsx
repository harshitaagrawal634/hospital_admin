import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Inventory(){
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState('')
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState(null)
  const [requests, setRequests] = useState([])

  useEffect(()=>{
    api.get('/inventory').then(r=>setItems(r.data.items)).catch(()=>{})
    api.get('/requests/inventory').then(r=>setRequests(r.data.requests)).catch(()=>{})
  },[])

  const submit = async (e) =>{
    e.preventDefault(); setMsg(null)
    try{
      await api.post('/requests/inventory', { itemId: selected, quantity: Number(qty) })
      setMsg('Inventory requested — staff will process')
      const r = await api.get('/requests/inventory'); setRequests(r.data.requests)
    }catch(err){ setMsg(err.response?.data?.message || err.message) }
  }

  return (
    <div style={{padding:20}}>
      <h2>Inventory</h2>
      <p>Request medical supplies or consumables.</p>

      <form onSubmit={submit} style={{maxWidth:540}}>
        <div style={{marginBottom:8}}>
          <label>Item</label>
          <select value={selected} onChange={e=>setSelected(e.target.value)} style={{width:'100%'}}>
            <option value="">-- choose item --</option>
            {items.map(it=> <option key={it._id} value={it._id}>{it.itemName} ({it.currentStock} {it.unit})</option>)}
          </select>
        </div>
        <div style={{marginBottom:8}}>
          <label>Quantity</label>
          <input value={qty} onChange={e=>setQty(e.target.value)} style={{width:120}} />
        </div>
        {msg && <div style={{marginTop:8,color:'var(--accent-dark)'}}>{msg}</div>}
        <div style={{marginTop:12}}>
          <button className="btn btn-primary" type="submit">Request Item</button>
        </div>
      </form>

      <h3 style={{marginTop:24}}>Your Inventory Requests</h3>
      <ul>
        {requests.map(r=> (
          <li key={r._id}>{r.item?.itemName || 'Item'} — {r.quantity} — {r.status}</li>
        ))}
      </ul>
    </div>
  )
}
