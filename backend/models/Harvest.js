const mongoose = require('mongoose');

const harvestSchema = mongoose.Schema(
  {
    tunnel: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Polytunnel',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

const Harvest = mongoose.model('Harvest', harvestSchema);
module.exports = Harvest;
