import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const emailRegexPattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;    
// Create a schema for User
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 50
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    validate: {
      validator: function (value) {
        return emailRegexPattern.test(value);
      },
      message: "Please enter valid email address",
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    min: 6,
  },
  refreshTokens: [
    {
      token: {
        type: String,
      },
      expires: {
        type: String,
      },
    },
  ],
}, { timestamps: true });

// Sign an access token
userSchema.methods.signAccessToken = function () {
  const user = this;
  return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
    expiresIn: '5m',
  });
};

// Sign a refresh token and store it in the user's document
userSchema.methods.signRefreshToken = function () {
  const user = this;

  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
    expiresIn: '3d',
  });

  user.refreshTokens.push({ token: refreshToken, expires: '3d' });
  return refreshToken;
};

// Hash the password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

// Compare the provided password with the stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;