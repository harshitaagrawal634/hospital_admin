const mongoose = require('mongoose');

// Load environment variables for the MongoDB URI
require('dotenv').config();
const { MONGO_URI, SKIP_DB } = process.env;

// If running in demo mode, export a no-op connector and do not validate MONGO_URI
if (SKIP_DB === 'true') {
    module.exports = async () => {
        console.log('SKIP_DB is true — not connecting to MongoDB (demo mode)');
    };
} else {
    // Fail fast if the connection string isn't provided
    if (!MONGO_URI) {
        console.error('Missing MONGO_URI environment variable. Please set MONGO_URI in your .env or environment.');
        process.exit(1);
    }

    /**
     * Connects to the MongoDB database using the URI from the .env file.
     */
    const connectDB = async () => {
        try {
            await mongoose.connect(MONGO_URI);
            console.log('MongoDB connection successful!');
        } catch (error) {
            console.error('MongoDB connection failed!', error);
            // Exit process with failure
            process.exit(1);
        }
    };

    module.exports = connectDB;
}
