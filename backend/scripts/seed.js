/**
 * Seed: creates one Tenant and one Admin user so you can log in.
 * Run: npm run seed (from backend folder).
 * Login: admin@worqhub.com / Admin@123 (Tenant ID printed below)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Tenant = require('../src/models/Tenant');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DEMO_EMAIL = 'admin@worqhub.com';
const DEMO_PASSWORD = 'Admin@123';

async function seed() {
  if (!MONGO_URI) {
    console.error('Set MONGO_URI or MONGODB_URI in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  let tenant = await Tenant.findOne({ name: 'Worqhub Demo' });
  if (!tenant) {
    tenant = await Tenant.create({ name: 'Worqhub Demo', plan: 'standard' });
    console.log('Created tenant:', tenant.name, tenant._id);
  } else {
    console.log('Using existing tenant:', tenant.name, tenant._id);
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let user = await User.findOne({ tenantId: tenant._id, email: DEMO_EMAIL });
  if (!user) {
    user = await User.create({
      tenantId: tenant._id,
      email: DEMO_EMAIL,
      passwordHash,
      name: 'Admin',
      role: 'Admin',
    });
    console.log('Created user:', user.email);
  } else {
    await User.updateOne({ _id: user._id }, { passwordHash });
    console.log('Updated password for:', user.email);
  }

  console.log('\n--- Login with these credentials ---');
  console.log('Email:     ', DEMO_EMAIL);
  console.log('Password:  ', DEMO_PASSWORD);
  console.log('Tenant ID: ', tenant._id.toString());
  console.log('-----------------------------------\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
