import React from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'

function App(){
  const [price, setPrice] = React.useState<number | null>(null)
  React.useEffect(()=>{
    axios.get('/markets/latest?symbol=BTCUSDT').then(r=> setPrice(r.data.price)).catch(()=> setPrice(null))
  },[])
  return (
    <div style={{padding:20}}>
      <h1>Crypto Monitor — Dashboard</h1>
      <p>BTC: <strong>{price === null ? '—' : price}</strong></p>
      <div id="chart">(chart placeholder)</div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
