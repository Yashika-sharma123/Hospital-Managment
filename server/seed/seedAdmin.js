// Run with: npm run seed:admin
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User.model');

const ADMIN_PHONE = process.env.SEED_ADMIN_PHONE || '9999999999';

async function seed() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB — seeding first admin account...');

  const existing = await User.findOne({ phone: ADMIN_PHONE });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_PHONE}`);
  } else {
    await User.create({
      name: 'SBM Hospital Admin',
      phone: ADMIN_PHONE,
      role: 'admin',
    });
    console.log(`Admin created -> phone: ${ADMIN_PHONE}`);
    console.log('Log in with this phone number using the OTP flow (OTP is printed in the server console).');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed();
