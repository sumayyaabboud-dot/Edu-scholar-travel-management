require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/Application');
const StudentProfile = require('./models/StudentProfile');
const ScholarshipOffer = require('./models/ScholarshipOffer');
const { calculateMatchScore } = require('./utils/matchScore');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Recalculating ai_match_score for every application...');

  const applications = await Application.find();
  let updated = 0;

  for (const app of applications) {
    const profile = await StudentProfile.findById(app.student_id);
    const offer = await ScholarshipOffer.findById(app.offer_id);
    if (!profile || !offer) continue;

    const correctScore = calculateMatchScore(profile.gpa, profile.major, offer.majors);
    if (app.ai_match_score !== correctScore) {
      console.log(`${app._id}: ${app.ai_match_score} -> ${correctScore}`);
      app.ai_match_score = correctScore;
      await app.save();
      updated++;
    }
  }

  console.log(`Done. ${updated} application(s) corrected out of ${applications.length}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});