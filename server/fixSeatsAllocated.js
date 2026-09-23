require('dotenv').config();
const mongoose = require('mongoose');
const ScholarshipOffer = require('./models/ScholarshipOffer');
const Application = require('./models/Application');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Recalculating seats_allocated for every offer...');

  const offers = await ScholarshipOffer.find();
  let updated = 0;

  for (const offer of offers) {
    const grantedCount = await Application.countDocuments({ offer_id: offer._id, status: 'Granted' });
    if (offer.seats_allocated !== grantedCount) {
      console.log(`${offer.university} (${offer.country}): ${offer.seats_allocated} -> ${grantedCount}`);
      offer.seats_allocated = grantedCount;
      await offer.save();
      updated++;
    }
  }

  console.log(`Done. ${updated} offer(s) corrected out of ${offers.length}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});