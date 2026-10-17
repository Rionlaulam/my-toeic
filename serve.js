const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const port = Number(process.env.PORT || 8000);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml; charset=utf-8', '.md':'text/markdown; charset=utf-8' };
http.createServer((req,res)=>{
  let requested;
  try { requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  const relative = requested === '/' ? '/index.html' : requested;
  const file = path.resolve(root, '.' + relative);
  if (!file.startsWith(root + path.sep) && file !== path.join(root,'index.html')) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(file,(err,body)=>{ if(err){res.writeHead(404);res.end('Not found');return;} res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body); });
}).listen(port, '127.0.0.1', ()=>console.log(`Clearline is available at http://127.0.0.1:${port}`));
