require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Log = require('./models/Log');

mongoose.connect(process.env.MONGO_URI);

const demoUsers = [
  'alice@gmail.com',
  'bob@gmail.com',
  'carol@gmail.com',
  'dave@gmail.com',
];

const sampleContents = [
  'Completed dashboard UI updates',
  'Fixed authentication bug',
  'Worked on analytics integration',
  'Implemented calendar drill-down',
  'Tested password reset flow',
  'Optimized API performance',
  'Reviewed employee submissions',
  'Updated admin dashboard',
  'Improved search filtering',
  'Fixed responsive layout issues',
  'Added date range selector',
  'Worked on worklog validations',
  'Cleaned backend controllers',
  'Refactored analytics queries',
  'Improved database performance',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack = 30) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));

  return date.toISOString().split('T')[0];
}

async function seedLogs() {
  try {
    for (const email of demoUsers) {
      const user = await User.findOne({ email });

      if (!user) {
        console.log(`User not found: ${email}`);
        continue;
      }

      // create 15 random logs per user
      for (let i = 0; i < 15; i++) {
        const date = randomDate();

        // avoid duplicate same-day logs
        const exists = await Log.findOne({
          userId: user._id,
          date,
        });

        if (exists) continue;

        const log = new Log({
          userId: user._id,
          date,
          content: randomItem(sampleContents),
        });

        await log.save();
      }

      console.log(`Seeded logs for ${email}`);
    }

    console.log('Demo logs seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedLogs();
