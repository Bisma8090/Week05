// Run once: node seed-admin.js
// Creates an admin user: admin@admin.com / admin123
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/comment-system');
  const User = mongoose.model('User', new mongoose.Schema({
    username: String, email: String, password: String,
    bio: String, profilePicture: String,
    followersCount: Number, followingCount: Number,
    isApproved: Boolean, isAdmin: Boolean,
  }, { timestamps: true }));

  const existing = await User.findOne({ email: 'admin@admin.com' });
  if (existing) { console.log('Admin already exists'); process.exit(0); }

  const password = await bcrypt.hash('admin123', 10);
  await User.create({
    username: 'admin', email: 'admin@admin.com', password,
    isApproved: true, isAdmin: true,
    bio: '', profilePicture: '', followersCount: 0, followingCount: 0,
  });
  console.log('Admin created: admin@admin.com / admin123');
  process.exit(0);
}
seed().catch(console.error);
