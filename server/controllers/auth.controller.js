const User = require('../models/User.model');
const Otp = require('../models/Otp.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateOtpCode, sendOtp } = require('../utils/otpService');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const env = require('../config/env');

const OTP_EXPIRY_MINUTES = env.otp.expiryMinutes;
const MAX_VERIFY_ATTEMPTS = 5;

// @route   POST /api/auth/request-otp
// @access  Public
// Works for everyone: if the phone already belongs to a staff/admin account
// (created by an admin), the OTP logs them into THAT account. If the phone
// is new, this creates a fresh "customer" account automatically — customers
// never need an admin to onboard them.
const requestOtp = asyncHandler(async (req, res) => {
  const { phone, name } = req.body;

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ name: name || 'Guest', phone, role: 'customer' });
  }
  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

  // invalidate any previous unverified OTPs for this phone, then create a fresh one
  await Otp.deleteMany({ phone, verified: false });
  await Otp.create({ phone, code, expiresAt });

  await sendOtp(phone, code);

  const responseData = { phone, expiresInMinutes: OTP_EXPIRY_MINUTES };

  // DEV-ONLY CONVENIENCE: since no paid SMS gateway is connected for this
  // college project, the OTP is echoed back in the response so the demo
  // can be run end-to-end without needing a real phone/SMS service.
  // Remove this block entirely before any real deployment.
  if (env.nodeEnv !== 'production' || env.otp.demoOtp) {
  responseData.devOtp = code;
}

  new ApiResponse(200, responseData, 'OTP sent').send(res);
});

// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, code } = req.body;

  const otpRecord = await Otp.findOne({ phone, verified: false }).sort({ createdAt: -1 });
  if (!otpRecord) {
    throw new ApiError(400, 'No OTP request found for this phone — request a new one');
  }
  if (otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, 'OTP has expired — request a new one');
  }
  if (otpRecord.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new ApiError(429, 'Too many incorrect attempts — request a new OTP');
  }

  if (otpRecord.code !== code) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, 'Incorrect OTP');
  }

  otpRecord.verified = true;
  await otpRecord.save();

  const user = await User.findOne({ phone });
  if (!user) throw new ApiError(404, 'Account not found');

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  new ApiResponse(200, { user: user.toSafeObject(), accessToken, refreshToken }, 'Login successful').send(res);
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  new ApiResponse(200, { user: req.user.toSafeObject() }, 'Current user').send(res);
});

// @route   POST /api/auth/staff
// @access  Private/Admin only
const createStaffOrAdmin = asyncHandler(async (req, res) => {
  const { name, phone, email, role } = req.body;

  const existing = await User.findOne({ phone });
  if (existing) {
    throw new ApiError(409, 'An account with this phone number already exists');
  }

  const user = await User.create({ name, phone, email: email || undefined, role });
  new ApiResponse(201, { user: user.toSafeObject() }, `${role} account created`).send(res);
});

module.exports = { requestOtp, verifyOtp, getMe, createStaffOrAdmin };
