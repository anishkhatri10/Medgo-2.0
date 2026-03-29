require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const createAdmin = async () => {
  await connectDB();

  try {
    const existing = await User.findOne({ email: 'admin@medgo.np' });
    if (existing) {
      console.log('');
      console.log('⚠️  Admin already exists!');
      console.log('================================');
      console.log('📧 Email:    admin@medgo.np');
      console.log('🔑 Password: admin123456');
      console.log('================================');
      process.exit(0);
    }

    await User.create({
      name: 'MedGo Admin',
      phone: '9800000000',
      email: 'admin@medgo.np',
      password: 'admin123456',
      role: 'admin',
      isActive: true,
    });

    console.log('');
    console.log('✅ Admin created successfully!');
    console.log('================================');
    console.log('📧 Email:    admin@medgo.np');
    console.log('🔑 Password: admin123456');
    console.log('🌐 Login at: http://localhost:5174/login');
    console.log('================================');
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
};

createAdmin();