require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const School = require('./models/School');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const ScholarshipOffer = require('./models/ScholarshipOffer');
const Application = require('./models/Application');

const firstNames = ['Layla','Yousef','Maya','Karim','Nour','Hassan','Rania','Omar','Dana','Ali','Sara','Fadi','Lina','Ahmad','Rima','Tarek','Salma','Bilal','Yasmine','Nabil','Hala','Rami','Reem','Zain','Elias','Joudy','Amir','Farah','Ziad','Mona'];
const lastNames = ['Khalil','Haddad','Youssef','Saad','Nassar','Fakhoury','Abdallah','Rahme','Tannous','Chami','Karam','Aoun','Salloum','Barakat','Mansour','Sabbagh','Daher','Khoury','Nakhle','Farhat'];

function randomName() {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${f} ${l}`;
}
function randomGPA() {
  // rough spread: ~20% below 70, ~50% 70-85, ~30% 86-100
  const r = Math.random();
  if (r < 0.2) return Math.floor(50 + Math.random() * 20);      // 50-69
  if (r < 0.7) return Math.floor(70 + Math.random() * 16);      // 70-85
  return Math.floor(86 + Math.random() * 15);                    // 86-100
}
function tierFromGPA(gpa) {
  if (gpa < 70) return 'Rejected';
  if (gpa <= 85) return 'Partial';
  return 'Full';
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');

  await Promise.all([
    School.deleteMany({}),
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    ScholarshipOffer.deleteMany({}),
    Application.deleteMany({})
  ]);

  // ---- 1. Schools ----
  const schools = await School.insertMany([
    {
      school_name: 'Al Galilee Secondary School (UNRWA)',
      region: 'Beirut (Bir Hassan)',
      contact_email: 'info@unrwa.org',
      phone_number: '+961 1 840 490'
    },
    {
      school_name: 'Tripoli Evangelical School',
      region: 'North Lebanon',
      contact_email: 'info@tes.edu.lb',
      phone_number: '+961 6 000 000'
    }
  ]);

  // ---- 2. Staff / admin users (password for ALL of them: "Password123!") ----
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const superAdmin = await User.create({
    name: 'Admin User', email: 'admin@eduscholar.com', password_hash: passwordHash, role: 'super_admin'
  });
  const schoolAdmin1 = await User.create({
    name: 'Rana Fakhoury', email: 'rana.fakhoury@eduscholar.com', password_hash: passwordHash, role: 'school_admin', school_id: schools[0]._id
  });
  const schoolAdmin2 = await User.create({
    name: 'Elias Khalil', email: 'elias.khalil@eduscholar.com', password_hash: passwordHash, role: 'school_admin', school_id: schools[1]._id
  });
  const donorUSA = await User.create({
    name: 'Michael Turner', email: 'donor.usa@eduscholar.com', password_hash: passwordHash, role: 'donor', assigned_country: 'USA'
  });
  const donorGermany = await User.create({
    name: 'Anna Weber', email: 'donor.germany@eduscholar.com', password_hash: passwordHash, role: 'donor', assigned_country: 'Germany'
  });
  const donorUAE = await User.create({
    name: 'Fatima Al Suwaidi', email: 'donor.uae@eduscholar.com', password_hash: passwordHash, role: 'donor', assigned_country: 'UAE'
  });
  await User.create({
    name: 'Joseph Matta', email: 'agent@eduscholar.com', password_hash: passwordHash, role: 'travel_agent'
  });

  console.log('Users created. Login for all of them: Password123!');

  // ---- 3. Scholarship Offers: 3 countries x 3 universities x 5 majors ----
  const offersData = [
    // USA
    { country: 'USA', university: 'Arizona State University', total_seats: 30, majors: ['Computer Science','Business Administration','Mechanical Engineering','Public Health','Biomedical Engineering'] },
    { country: 'USA', university: 'University of Michigan', total_seats: 25, majors: ['Computer Science','Economics','Mechanical Engineering','Public Health','Data Science'] },
    { country: 'USA', university: 'Boston University', total_seats: 20, majors: ['International Relations','Business Administration','Computer Science','Public Health','Communication'] },
    // Germany
    { country: 'Germany', university: 'Technical University of Munich', total_seats: 25, majors: ['Mechanical Engineering','Computer Science','Electrical Engineering','Aerospace Engineering','Physics'] },
    { country: 'Germany', university: 'RWTH Aachen University', total_seats: 20, majors: ['Mechanical Engineering','Electrical Engineering','Computer Science','Civil Engineering','Chemical Engineering'] },
    { country: 'Germany', university: 'University of Stuttgart', total_seats: 15, majors: ['Mechanical Engineering','Aerospace Engineering','Computer Science','Electrical Engineering','Civil Engineering'] },
    // UAE
    { country: 'UAE', university: 'Khalifa University', total_seats: 50, majors: ['Electrical Engineering','Computer Science','Mechanical Engineering','Biomedical Engineering','Aerospace Engineering'] },
    { country: 'UAE', university: 'American University of Sharjah', total_seats: 30, majors: ['Business Administration','Architecture','Computer Science','Civil Engineering','Mass Communication'] },
    { country: 'UAE', university: 'United Arab Emirates University', total_seats: 20, majors: ['Medicine','Public Health','Business Administration','Education','Information Technology'] }
  ];

  const donorByCountry = { USA: donorUSA, Germany: donorGermany, UAE: donorUAE };

  const offers = [];
  for (const o of offersData) {
    const offer = await ScholarshipOffer.create({
      user_id: superAdmin._id,
      country: o.country,
      university: o.university,
      offer_type: 'Full + Partial',
      total_seats: o.total_seats,
      majors: o.majors
    });
    offers.push(offer);
  }
  console.log(`${offers.length} scholarship offers created.`);

  // ---- 4. Students + Applications (80 total, spread across both schools & all offers) ----
  const schoolAdminPairs = [
    { school: schools[0], admin: schoolAdmin1 },
    { school: schools[1], admin: schoolAdmin2 }
  ];

  let created = 0;
  for (let i = 0; i < 80; i++) {
    const name = randomName();
    const gpa = randomGPA();
    const tier = tierFromGPA(gpa);
    const offer = offers[Math.floor(Math.random() * offers.length)];
    const major = offer.majors[Math.floor(Math.random() * offer.majors.length)];
    const pair = schoolAdminPairs[Math.floor(Math.random() * schoolAdminPairs.length)];

    const studentUser = await User.create({
      name,
      email: `student${i}@eduscholar.com`,
      password_hash: passwordHash,
      role: 'student'
    });

    const profile = await StudentProfile.create({
      user_id: studentUser._id,
      school_id: pair.school._id,
      dob: new Date(2005 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 27)),
      phone: `+961 70 ${100000 + Math.floor(Math.random() * 899999)}`,
      gpa,
      major
    });

    let status = 'Pending';
    if (tier === 'Rejected') {
      status = 'Rejected';
    } else {
      const r = Math.random();
      if (r < 0.4) status = 'Pending';
      else if (r < 0.65) status = 'Under Review';
      else if (r < 0.85) status = 'Granted';
      else status = 'Waitlisted';
    }

    await Application.create({
      student_id: profile._id,
      offer_id: offer._id,
      submitted_by: pair.admin._id,
      school_id: pair.school._id,
      tier,
      status,
      ai_match_score: Math.floor(60 + Math.random() * 40),
      ocr_verified: true
    });

    created++;
  }

  console.log(`${created} students + applications created.`);
  console.log('Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});