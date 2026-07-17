const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  userType: { type: String, enum: ['individual', 'community_admin', 'system_admin'], default: 'individual' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  socialLinks: {
    linkedin:   { type: String, default: '' },
    github:     { type: String, default: '' },
    leetcode:   { type: String, default: '' },
    codeforces: { type: String, default: '' },
    twitter:    { type: String, default: '' },
    portfolio:  { type: String, default: '' },
    kaggle:     { type: String, default: '' },
    medium:     { type: String, default: '' },
  },
  platformStatsCache: {
    github:     { stats: { type: Object, default: null }, fetchedAt: { type: Date, default: null } },
    leetcode:   { stats: { type: Object, default: null }, fetchedAt: { type: Date, default: null } },
    codeforces: { stats: { type: Object, default: null }, fetchedAt: { type: Date, default: null } },
    kaggle:     { stats: { type: Object, default: null }, fetchedAt: { type: Date, default: null } },
    medium:     { stats: { type: Object, default: null }, fetchedAt: { type: Date, default: null } },
  },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  emailNotifications: { type: Boolean, default: true },
  projectUpdates: { type: Boolean, default: true },
  communityUpdates: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
