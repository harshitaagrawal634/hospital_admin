require('dotenv').config();
const connectDB = require('../src/config/db.config');
const User = require('../src/models/User');

const users = [
  { username: 'admin', email: 'harshita.agrawal634@gmail.com', password: 'Admin123!', role: 'admin' },
  { username: 'dr1', email: 'doctor@local.com', password: 'Doctor123!', role: 'doctor' },
  { username: 'nurse1', email: 'nurse@local.com', password: 'Nurse123!', role: 'nurse' },
  { username: 'patient1', email: 'patient@local.com', password: 'Patient123!', role: 'patient' }
]

const run = async () => {
  try {
    await connectDB();
    for (const u of users) {
      try {
        const existing = await User.findOne({ email: u.email });
        if (existing) {
          console.log(`User ${u.email} exists, skipping`)
          continue
        }
        await User.create(u)
        console.log(`Created ${u.email}`)
      } catch (userErr) {
        console.error(`Failed to create ${u.email}:`, userErr && userErr.message ? userErr.message : userErr)
        // log stack for debugging
        if (userErr && userErr.stack) console.error(userErr.stack)
        // continue with next user
      }
    }
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
