import React, { useEffect, useState } from 'react'

function apiFetch(path, token, opts = {}){
  const headers = opts.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  return fetch(path, { ...opts, headers });
}

function AuthForm({ mode, onSuccess }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)

  async function submit(e){
    e.preventDefault()
    setErr(null)
    const path = mode === 'login' ? '/auth/login' : '/auth/register'
    const res = await fetch(path, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
    const json = await res.json()
    if (!res.ok) return setErr(json.error || 'Erreur')
    onSuccess(json.token, json.user)
  }

  return (
    <form onSubmit={submit} style={{ marginBottom: 12 }}>
      <div>{err && <strong style={{color:'red'}}>{err}</strong>}</div>
      <div>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      </div>
      <div>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" />
      </div>
      <button type="submit">{mode === 'login' ? 'Se connecter' : 'S'inscrire'}</button>
    </form>
  )
}

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [mode, setMode] = useState('login')

  useEffect(()=>{
    if (token) loadItems()
  }, [token])

  async function loadItems(){
    const res = await apiFetch('/api/items', token)
    if (!res.ok) return setItems([])
    const json = await res.json()
    setItems(json)
  }

  async function addItem(e){
    e.preventDefault()
    if (!name) return
    const res = await apiFetch('/api/items', token, { method: 'POST', body: JSON.stringify({ name }) })
    const json = await res.json()
    if (res.ok) setItems(prev => [...prev, json])
    setName('')
  }

  function onAuthSuccess(token, user){
    setToken(token)
    setUser(user)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  function logout(){
    setToken(null); setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user'); setItems([])
  }

  if (!token) {
    return (
      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h1>my-saas — Auth</h1>
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setMode('login')}>Login</button>
          <button onClick={() => setMode('register')}>Register</button>
        </div>
        <AuthForm mode={mode} onSuccess={onAuthSuccess} />
      </div>
    )
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>my-saas</h1>
      <p>Connecté en tant que: {user?.email} <button onClick={logout}>Se déconnecter</button></p>

      <form onSubmit={addItem} style={{ marginBottom: 16 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nouvel item" />
        <button type="submit">Ajouter</button>
      </form>

      <ul>
        {items.map(i => <li key={i.id}>{i.name}</li>)}
      </ul>
    </div>
  )
}
