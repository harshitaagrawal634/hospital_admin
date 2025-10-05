require('dotenv').config();
const connectDB = require('../src/config/db.config');
const User = require('../src/models/User');

(async function(){
  try {
    await connectDB();
    const email = process.argv[2] || 'harshita.agrawal634@gmail.com';
    const u = await User.findOne({ email }).lean();
    if (!u) {
      console.log(JSON.stringify({ found: false, email }, null, 2));
    } else {
      console.log(JSON.stringify({ found: true, user: { email: u.email, username: u.username, role: u.role, _id: u._id } }, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
