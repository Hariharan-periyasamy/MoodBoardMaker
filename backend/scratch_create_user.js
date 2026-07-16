const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'testcollab@example.com';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User already exists');
      process.exit(0);
    }

    const newUser = await User.create({
      name: 'John Doe',
      email: email,
      passwordHash: 'password123', // Will be hashed automatically by pre-save
      bio: 'Co-designer testing real-time workspaces',
      avatarColor: '#D97706'
    });

    console.log('Successfully created test user:', newUser.name);
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err.message);
    process.exit(1);
  }
};

createTestUser();
