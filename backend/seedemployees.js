
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI);

const employees = [
    {
    username: 'admin',
    email: 'admin@gmail.com',
    password: 'demo123',
    role: 'admin',
    displayName: 'demo',
    isDemo: true,
   },

  {
    username: 'alice@gmail.com',
    email: 'alice@gmail.com',
    password: 'demo123',
    role: 'employee',
    displayName: 'Alice',
  },

  {
    username: 'bob@gmail.com',
    email: 'bob@gmail.com',
    password: 'demo123',
    role: 'employee',
    displayName: 'Bob',
  },

  {
    username: 'carol@gmail.com',
    email: 'carol@gmail.com',
    password: 'demo123',
    role: 'employee',
    displayName: 'Carol',
  },

  {
    username: 'dave@gmail.com',
    email: 'dave@gmail.com',
    password: 'demo123',
    role: 'employee',
    displayName: 'Dave',
  },

];

async function seed() {
  try {
    for (const emp of employees) {
      const exists = await User.findOne({ email: emp.email });

      if (exists) {
        console.log(`${emp.email} already exists`);
        continue;
      }

      const user = new User(emp);

      await user.save();

      console.log(`Created ${emp.email}`);
    }

    console.log('Seeding complete');

    process.exit();
  } catch (err) {
    console.error(err);

    process.exit(1);
  }
}

seed();
