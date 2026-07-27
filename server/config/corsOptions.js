const env = require('./env');

// FIX: Vite sometimes auto-switches ports (5173 -> 5174, etc.) if the
// default port is already busy from a previous session. That silently
// broke OTP requests with a CORS error that looked like "Failed to send
// OTP" on the frontend with no useful backend log. In development, any
// localhost/127.0.0.1 origin is now allowed regardless of port. In
// production, it strictly matches CLIENT_ORIGIN only.
const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // curl/Postman/mobile apps

    if (env.nodeEnv !== 'production' && localhostPattern.test(origin)) {
      return callback(null, true);
    }
    if (origin === env.clientOrigin) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
