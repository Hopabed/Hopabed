const https = require('https');

const urls = [
  'https://hopebed.in/',
  'https://hopebed.in/robots.txt',
  'https://hopebed.in/sitemap.xml',
  'https://hopebed.in/stays',
  'https://hopebed.in/contact',
  'https://hopebed.in/host'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let body = '';
      res.on('data', chunk => { if (body.length < 500) body += chunk; });
      res.on('end', () => {
        resolve({ url, statusCode: res.statusCode, headers: res.headers, preview: body.substring(0, 150) });
      });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function run() {
  console.log('--- Checking URLs ---');
  for (const u of urls) {
    const res = await testUrl(u);
    if (res.error) {
      console.log(`❌ ${res.url} -> Error: ${res.error}`);
    } else {
      console.log(`✅ [${res.statusCode}] ${res.url}`);
      if (res.url.endsWith('.xml') || res.url.endsWith('.txt')) {
        console.log(`   Preview: ${res.preview.replace(/\n/g, ' ')}`);
      }
    }
  }
}

run();
