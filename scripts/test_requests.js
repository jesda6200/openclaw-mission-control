const http = require('http');

function request(path){
  return new Promise((resolve,reject)=>{
    http.get({host:'127.0.0.1',port:4000,path,timeout:2000},(res)=>{
      let body='';
      res.on('data',c=>body+=c);
      res.on('end',()=>resolve({status:res.statusCode,body}));
    }).on('error',reject);
  });
}

(async ()=>{
  try{
    const h = await request('/health');
    console.log('/health',h.status,h.body);
    const m = await request('/markets/latest');
    console.log('/markets/latest',m.status,m.body);
    process.exit(0);
  }catch(e){
    console.error('Requests failed',e);
    process.exit(2);
  }
})();
