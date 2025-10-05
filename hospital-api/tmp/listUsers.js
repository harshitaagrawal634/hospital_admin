require('dotenv').config();
const connectDB = require('../src/config/db.config');
const User = require('../src/models/User');

(async function(){
  try {
    await connectDB();
    const users = await User.find({}).select('username email role').lean();
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
