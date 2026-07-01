const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error('MONGODB_URI is not defined in backend/.env');
    }

    console.log('Connecting to database...');
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB.');

    // We prioritize variables from the environment, falling back to defaults if not set.
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@srinikaagrofoods.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const adminName = process.env.ADMIN_NAME || 'Srinika Agro Admin';

    // Check whether the admin email already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists. Skipping.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create administrator account using User.create so pre-save hook hashes the password
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log('Admin account created successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedAdmin();
