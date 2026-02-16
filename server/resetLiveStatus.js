// Quick script to reset all isLive statuses to false
// Run this ONCE to fix the database

const mongoose = require('mongoose');
require('dotenv').config();

const Classroom = require('./models/Classroom');

const resetLiveStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const result = await Classroom.updateMany({}, { isLive: false });
        console.log(`✅ Reset ${result.modifiedCount} classrooms to isLive: false`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

resetLiveStatus();
