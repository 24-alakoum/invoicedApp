const http = require('http');
const data = JSON.stringify({
  name: 'Coulibaly SARL',
  email: 'contact@coulibaly.bj',
  phone: '+229 97000001',
  address: 'Cotonou, Benin'
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/clients',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
