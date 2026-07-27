const mongoose = require('mongoose');

// Populated automatically whenever a Token reaches a final state
// (served / no-show / cancelled). Kept denormalized and separate from
// the live Token collection so analytics + ML queries never have to
// scan or join against the live, frequently-updated queue data.
const historySchema = new mongoose.Schema(
  {
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    counter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counter',
      default: null,
    },

    finalStatus: {
      type: String,
      enum: ['served', 'no-show', 'cancelled'],
      required: true,
    },

    bookingType: {
      type: String,
      enum: ['online', 'walk-in'],
      required: true,
    },
    priorityType: {
      type: String,
      enum: ['normal', 'senior-citizen', 'pregnant', 'emergency'],
      default: 'normal',
    },

    // features used to train / evaluate the prediction models
    hour: { type: Number, required: true },       // 0-23, hour token was booked
    dayOfWeek: { type: Number, required: true },   // 0=Sunday .. 6=Saturday
    queueLengthAtBooking: { type: Number, required: true },
    leadTimeMinutes: { type: Number, required: true }, // 0 for walk-ins

    // outcomes
    waitTimeMinutes: { type: Number, default: null },      // actual wait, if served
    serviceDurationMinutes: { type: Number, default: null }, // actual time at counter
    predictedWaitMinutes: { type: Number, default: null },  // what the AI predicted
    noShowProbability: { type: Number, default: null },     // what the AI predicted

    rating: { type: Number, min: 1, max: 5, default: null },
  },
  { timestamps: true }
);

historySchema.index({ service: 1, hour: 1, dayOfWeek: 1 });

module.exports = mongoose.model('History', historySchema);
