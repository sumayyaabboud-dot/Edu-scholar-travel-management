const fs = require('fs');
const BASE = 'http://localhost:5000';

async function run() {
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'donor.uae@eduscholar.com', password: 'Password123!' })
  });
  const { accessToken } = await loginRes.json();

  const pdfRes = await fetch(`${BASE}/api/donor/report/pdf`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!pdfRes.ok) {
    const errText = await pdfRes.text();
    throw new Error('PDF request failed: ' + errText);
  }

  const buffer = Buffer.from(await pdfRes.arrayBuffer());
  fs.writeFileSync('donor_report.pdf', buffer);
  console.log('✔ PDF saved as donor_report.pdf');
}

run().catch(err => console.error('❌ FAILED:', err.message));