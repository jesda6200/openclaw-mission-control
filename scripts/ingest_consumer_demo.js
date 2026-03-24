// demo consumer: read from Redis list/stream and write to Postgres (very minimal)
const { createClient } = require('redis')
const { Client } = require('pg')

async function run(){
  const r = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' })
  await r.connect()
  const pg = new Client({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres' })
  await pg.connect()
  console.log('connected to redis & pg (demo)')
  // demo: push a sample row
  const now = new Date().toISOString()
  await pg.query('INSERT INTO prices(symbol, time, price, volume, source) VALUES($1,$2,$3,$4,$5)', ['BTCUSDT', now, 30000, 1, 'demo'])
  console.log('inserted demo price')
  await pg.end()
  await r.disconnect()
}
run().catch(e=>{console.error(e); process.exit(1)})
