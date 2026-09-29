const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String, // e.g. "A-042"
      required: true,
    },
    // Determines position in the live queue. Same as createdAt initially,
    // but updated to "now" when a no-show token re-enters — so it goes
    // to the back of the current queue instead of keeping its original spot.
    queueEntryTime: {
      type: Date,
      default: Date.now,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    counter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counter',
      default: null, // assigned only when called
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for guest/walk-in tokens booked without login
    },
    guestName: {
      type: String,
      trim: true,
      default: null, // used when there's no linked User (walk-in)
    },
    guestPhone: {
      type: String,
      trim: true,
      default: null,
    },

    bookingType: {
      type: String,
      enum: ['online', 'walk-in'],
      required: true,
    },

    // ---- priority / fairness ----
    priorityType: {
      type: String,
      enum: ['normal', 'senior-citizen', 'pregnant', 'emergency'],
      default: 'normal',
    },
    // computed score combining priority weight + wait time so normal
    // tokens are never starved indefinitely — see ml/priorityScorer.js
    priorityScore: {
      type: Number,
      default: 0,
    },

    // ---- lifecycle status ----
    status: {
      type: String,
      enum: [
        'waiting',      // in queue, not yet called
        'called',       // staff called this token, grace period running
        'grace-period', // called, grace period actively expiring
        'served',       // completed successfully
        'no-show',      // grace period expired, customer didn't arrive
        're-queued',     // no-show customer returned within re-entry window
        'cancelled',    // customer cancelled, or re-entry window expired
      ],
      default: 'waiting',
    },

    // ---- AI predictions (filled in at booking time) ----
    predictedWaitMinutes: {
      type: Number,
      default: null,
    },
    noShowProbability: {
      type: Number, // 0 to 1
      default: null,
    },

    // ---- timestamps for each lifecycle transition ----
    calledAt: { type: Date, default: null },
    graceExpiresAt: { type: Date, default: null },
    servedAt: { type: Date, default: null },
    noShowAt: { type: Date, default: null },
    reQueuedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    // snapshot of how many people were already waiting when this token
    // was created — used later for analytics and ML training features
    queueLengthAtBooking: {
      type: Number,
      default: 0,
    },

    // re-entry bookkeeping
    originalPosition: { type: Number, default: null },
    reQueueCount: { type: Number, default: 0 }, // capped — see business logic in controller

    // customer feedback after being served
    rating: { type: Number, min: 1, max: 5, default: null },
  },
  { timestamps: true }
);

// Common queries: "give me the live waiting queue for a service, oldest first"
tokenSchema.index({ service: 1, status: 1, createdAt: 1 });

module.exports = mongoose.model('Token', tokenSchema);
