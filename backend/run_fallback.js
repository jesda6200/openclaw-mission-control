const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbfile = process.env.SQLITE_FILE || path.join(__dirname, 'data', 'fallback.sqlite');
const app = express();
app.use(express.json());
function openDb(){
  const db = new sqlite3.Database(dbfile);
  return db;
}
app.get('/health', (_req, res)=> res.json({status:'ok'}));
app.get('/markets/latest', (req, res)=>{
  const symbol = (req.query.symbol) || 'BTCUSDT';
  const db = openDb();
  db.get('SELECT * FROM prices WHERE symbol = ? ORDER BY id DESC LIMIT 1', [symbol], (err,row)=>{
    db.close();
    if(err){ return res.status(500).json({error:err.message}); }
    if(!row) return res.status(404).json({error:'not found'});
    res.json(row);
  });
});
const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log('Fallback backend listening on', port));
