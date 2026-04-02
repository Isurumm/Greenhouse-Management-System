const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: true,
      unique: true,
    },
    model: {
      type: String,
      required: true,
    },
    capacity: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Maintenance'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
