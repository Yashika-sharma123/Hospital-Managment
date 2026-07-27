const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String, // short slug used in token numbers, e.g. "A" for General OPD
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 3,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // baseline used until enough real history accumulates for the ML model
    avgServiceTimeMinutes: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
