// script minimal pour seed symbols
const { Client } = require('pg')
async function run(){
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres' })
  await client.connect()
  await client.query("INSERT INTO symbols(symbol, base, quote) VALUES ('BTCUSDT','BTC','USDT') ON CONFLICT DO NOTHING")
  console.log('seeded symbols')
  await client.end()
}
run().catch(e=>{console.error(e); process.exit(1)})
