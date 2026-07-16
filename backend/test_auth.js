const http = require('http');

async function testLogin(email, password) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ email, password });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`\nStatus: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log('Response:', JSON.stringify(parsed, null, 2));
        } catch {
          console.log('Raw response:', data);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('Connection ERROR - Backend may not be running!');
      console.error('Error:', e.message);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

async function testRegister(name, email, password) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ name, email, password });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`\n[Register] Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log('Response:', JSON.stringify(parsed, null, 2));
        } catch {
          console.log('Raw response:', data);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('Connection ERROR - Backend may not be running!');
      console.error('Error:', e.message);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('=== Testing Login: sara@example.com / password123 ===');
  await testLogin('sara@example.com', 'password123');

  console.log('\n=== Testing Login: raasika@gmail.com / (try common pw) ===');
  await testLogin('raasika@gmail.com', 'password123');

  console.log('\n=== Testing Wrong Password ===');
  await testLogin('sara@example.com', 'wrongpassword');
  
  console.log('\n=== Testing Non-existent User ===');
  await testLogin('nobody@test.com', 'test123');
}

run();
