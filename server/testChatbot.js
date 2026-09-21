const BASE = 'http://localhost:5000';

async function run() {
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student0@eduscholar.com', password: 'Password123!' })
  });
  const { accessToken } = await loginRes.json();

  const questions = [
    'What is the visa discount for a partial scholarship?',
    'What is the weather like today?'
  ];

  for (const question of questions) {
    const res = await fetch(`${BASE}/api/chatbot/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    console.log(`Q: ${question}`);
    console.log(`A: ${data.answer}`);
    console.log('---');
  }
}

run().catch(err => console.error('FAILED:', err.message));