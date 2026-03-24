const http = require('http');
const fs = require('fs');
const path = require('path');
const DB_FILE = path.resolve(__dirname,'../data/local.sqlite');

const port = process.env.PORT || 4000;

const server = http.createServer((req,res)=>{
  if(req.url === '/health'){
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify({status:'ok'}));
    return;
  }
  if(req.url === '/markets/latest'){
    // read DB file if exists and return some seeded data
    let markets = [{symbol:'EURUSD',price:1.2345}];
    try{
      if(fs.existsSync(DB_FILE)){
        const raw = fs.readFileSync(DB_FILE,'utf8');
        // crude parse: look for lines like SYMBOL=PRICE
        markets = raw.split('\n').filter(Boolean).map(l=>{const [s,p]=l.split('=');return {symbol:s,price:parseFloat(p)}});
      }
    }catch(e){/* ignore */}
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify({markets}));
    return;
  }
  res.writeHead(404,{'Content-Type':'text/plain'});
  res.end('Not Found');
});

server.listen(port,()=>{
  console.log('mock server listening on',port);
});

// graceful shutdown
process.on('SIGTERM',()=>{
  server.close(()=>process.exit(0));
});
process.on('SIGINT',()=>{
  server.close(()=>process.exit(0));
});
