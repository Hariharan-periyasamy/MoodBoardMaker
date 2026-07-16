const http = require('http');

function testLogin(email, password) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost', port: 5000,
      path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        const ok = parsed.success;
        console.log(`[${ok ? '✅' : '❌'}] ${email} / ${password} → ${parsed.message}`);
        if (ok) console.log(`   Token issued for: ${parsed.data.user.name}`);
        resolve();
      });
    });
    req.on('error', (e) => { console.log('Backend not running:', e.message); resolve(); });
    req.write(body); req.end();
  });
}

async function run() {
  console.log('=== Login Tests ===');
  await testLogin('hari@gmail.com', '123456');      // Should PASS now
  await testLogin('hari@gmail.coom', '123456');     // Should FAIL (old typo)
  await testLogin('sara@example.com', 'password123'); // Should PASS
  await testLogin('raasika@gmail.com', 'password123'); // Check
}
run();
