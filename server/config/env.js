require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  hospitalName: process.env.HOSPITAL_NAME || 'SBM Hospital',

  mongoUri: process.env.MONGO_URI,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  otp: {
    expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
  },

  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  rateLimit: {
    windowMinutes: Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15,
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  queue: {
    gracePeriodMinutes: Number(process.env.GRACE_PERIOD_MINUTES) || 7,
    reEntryWindowMinutes: Number(process.env.RE_ENTRY_WINDOW_MINUTES) || 20,
  },
};
