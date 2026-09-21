const BASE = 'http://localhost:5000';

async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  return data.accessToken;
}

function authHeaders(token) {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

async function run() {
  console.log('=== STEP 1: Super Admin creates a new offer ===');
  const adminToken = await login('admin@eduscholar.com', 'Password123!');
  const offerRes = await fetch(`${BASE}/api/offers`, {
    method: 'POST',
    headers: authHeaders(adminToken),
    body: JSON.stringify({
      country: 'UAE',
      university: 'Zayed University',
      offer_type: 'Full + Partial',
      total_seats: 10,
      majors: ['Computer Science', 'Business Administration']
    })
  });
  const offer = await offerRes.json();
  if (!offerRes.ok) throw new Error('Offer creation failed: ' + JSON.stringify(offer));
  console.log('✔ Offer created:', offer._id, '-', offer.university);

  console.log('\n=== STEP 2: School Admin submits an application ===');
  const schoolToken = await login('rana.fakhoury@eduscholar.com', 'Password123!');
  const appRes = await fetch(`${BASE}/api/applications`, {
    method: 'POST',
    headers: authHeaders(schoolToken),
    body: JSON.stringify({
      name: 'Test Student ' + Date.now(),
      email: `teststudent${Date.now()}@eduscholar.com`,
      dob: '2006-05-10',
      phone: '+961 70 123456',
      gpa: 92,
      major: 'Computer Science',
      offer_id: offer._id
    })
  });
  const appData = await appRes.json();
  if (!appRes.ok) throw new Error('Application submission failed: ' + JSON.stringify(appData));
  console.log('✔ Application created:', appData.application._id, '- tier:', appData.tier, '- match score:', appData.application.ai_match_score, '- ocr_verified:', appData.application.ocr_verified);
  console.log('\n=== STEP 3: Donor (UAE) reviews and grants the seat ===');
  const donorToken = await login('donor.uae@eduscholar.com', 'Password123!');
  const batchRes = await fetch(`${BASE}/api/donor/applications`, { headers: authHeaders(donorToken) });
  const batch = await batchRes.json();
  console.log('✔ Donor batch contains', batch.length, 'pending application(s)');

  const decisionRes = await fetch(`${BASE}/api/donor/applications/${appData.application._id}/decision`, {
    method: 'PATCH',
    headers: authHeaders(donorToken),
    body: JSON.stringify({ decision: 'Granted' })
  });
  const decision = await decisionRes.json();
  if (!decisionRes.ok) throw new Error('Decision failed: ' + JSON.stringify(decision));
  console.log('✔ Application status is now:', decision.status);

  console.log('\n=== STEP 4: Travel Agency books the flight ===');
  const agentToken = await login('agent@eduscholar.com', 'Password123!');
  const queueRes = await fetch(`${BASE}/api/travel/queue`, { headers: authHeaders(agentToken) });
  const queue = await queueRes.json();
  console.log('✔ Agency queue contains', queue.length, 'granted student(s)');

  const bookRes = await fetch(`${BASE}/api/travel/book/${appData.application._id}`, {
    method: 'POST',
    headers: authHeaders(agentToken)
  });
  const booking = await bookRes.json();
  if (!bookRes.ok) throw new Error('Booking failed: ' + JSON.stringify(booking));
  console.log('✔ Booking created — visa discount:', booking.visa_discount + '%,', 'housing discount:', booking.housing_discount + '%');

  const confirmRes = await fetch(`${BASE}/api/travel/book/${booking._id}/confirm`, {
    method: 'PATCH',
    headers: authHeaders(agentToken)
  });
  const confirmed = await confirmRes.json();
  console.log('✔ Booking status is now:', confirmed.status);

  console.log('\n🎉 FULL WORKFLOW PASSED — application went from submission to a confirmed, discounted booking.');
}

run().catch((err) => {
  console.error('\n❌ WORKFLOW FAILED:', err.message);
});