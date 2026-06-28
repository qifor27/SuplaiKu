const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
  role: 'OWNER',
  pin: '123456',
  csrfToken: '',
  json: 'true'
});

const options = {
  hostname: 'suplai-ku.vercel.app',
  port: 443,
  path: '/api/auth/callback/credentials',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`LOCATION: ${res.headers.location}`);
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
