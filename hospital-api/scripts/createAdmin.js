/**
 * scripts/createAdmin.js
 * One-off script to create a local admin user for development.
 * Usage: from the hospital-api folder run `node scripts/createAdmin.js`.
 * It reads MONGO_URI and other env from .env and will not create a duplicate if the email exists.
 */
require('dotenv').config();
const connectDB = require('../src/config/db.config');
const User = require('../src/models/User');

const run = async () => {
  try {
    await connectDB();

  const email = process.env.CREATE_ADMIN_EMAIL || 'harshita.agrawal634@gmail.com'
    const username = process.env.CREATE_ADMIN_USERNAME || 'admin'
    const password = process.env.CREATE_ADMIN_PASSWORD || 'Admin123!'

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`User with email ${email} already exists. Skipping creation.`);
      process.exit(0);
    }

    const user = await User.create({ username, email, password, role: 'admin' });
    console.log('Admin user created:');
    console.log({ id: user._id.toString(), email: user.email, username: user.username });
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err.message || err);
    process.exit(1);
  }
}

run();
