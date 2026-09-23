require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/Application');
const StudentProfile = require('./models/StudentProfile');
const User = require('./models/User');
const ScholarshipOffer = require('./models/ScholarshipOffer');
const { calculateMatchScore } = require('./utils/matchScore');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const applications = await Application.find();
  console.log('Name | GPA | Major | Offer Majors | Stored Score | Recomputed Score | Match?');
  console.log('-----|-----|-------|--------------|--------------|-------------------|-------');

  for (const app of applications) {
    const profile = await StudentProfile.findById(app.student_id);
    const user = profile ? await User.findById(profile.user_id) : null;
    const offer = await ScholarshipOffer.findById(app.offer_id);
    if (!profile || !offer) continue;

    const correct = calculateMatchScore(profile.gpa, profile.major, offer.majors);
    const match = app.ai_match_score === correct ? '✓' : '✗ MISMATCH';

    console.log(`${user?.name || '?'} | ${profile.gpa}% | ${profile.major} | ${offer.majors.join(', ')} | ${app.ai_match_score} | ${correct} | ${match}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run();