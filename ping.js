async function ping() {
  try {
    const response = await fetch('http://localhost:4000/');
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Ping failed:', err);
  }
}
ping();
