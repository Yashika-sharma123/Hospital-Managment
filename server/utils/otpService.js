const logger = require('./logger');

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code
}

/**
 * "Sends" the OTP. In this college-project setup there's no paid SMS
 * gateway (Twilio/MSG91/etc.) wired in, so it just logs to the server
 * console — enough to demo the full OTP flow end-to-end.
 *
 * To go to a real deployment, replace the body of this function with
 * an actual SMS API call, e.g.:
 *
 *   const twilioClient = require('twilio')(accountSid, authToken);
 *   await twilioClient.messages.create({ to: phone, from: TWILIO_NUMBER, body: `Your OTP is ${code}` });
 *
 * Nothing else in the OTP flow (auth.controller.js) needs to change.
 */
async function sendOtp(phone, code) {
  logger.info(`[OTP] ${code} for ${phone} (SMS gateway not connected — printed here for the demo)`);
}

module.exports = { generateOtpCode, sendOtp };
