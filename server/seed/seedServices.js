// Run with: npm run seed:services
// Creates SBM Hospital's departments so you can test token booking right away.
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const Service = require('../models/Service.model');

const services = [
  { name: 'General OPD', code: 'A', description: 'General physician consultation', avgServiceTimeMinutes: 6 },
  { name: 'Billing Counter', code: 'B', description: 'Payment and billing', avgServiceTimeMinutes: 4 },
  { name: 'Pharmacy', code: 'C', description: 'Medicine dispensing counter', avgServiceTimeMinutes: 3 },
  { name: 'Lab Tests', code: 'D', description: 'Sample collection and reports', avgServiceTimeMinutes: 8 },
];

async function seed() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB — seeding SBM Hospital departments...');

  for (const s of services) {
    const exists = await Service.findOne({ name: s.name });
    if (exists) {
      console.log(`Skipping "${s.name}" — already exists (id: ${exists._id})`);
      continue;
    }
    const created = await Service.create(s);
    console.log(`Created department "${created.name}" -> id: ${created._id}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed();
