const fs = require('fs');
const path = require('path');
const dataDir = path.resolve(__dirname,'../data');
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir,{recursive:true});
const DB_FILE = path.join(dataDir,'local.sqlite');

// This is a simple fallback "DB" file used for smoke tests. It's idempotent.
const seeded = 'EURUSD=1.2345\nBTCUSD=42000.00\n';
try{
  fs.writeFileSync(DB_FILE, seeded, {flag:'w'});
  console.log('Seeded fallback DB at',DB_FILE);
  process.exit(0);
}catch(e){
  console.error('Failed to seed DB',e);
  process.exit(2);
}
