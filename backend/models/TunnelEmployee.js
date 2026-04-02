const mongoose = require('mongoose');

const tunnelEmployeeSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    roleTitle: {
      type: String,
      required: true,
    },
    assignedTunnel: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'Polytunnel',
    },
  },
  {
    timestamps: true,
  }
);

const TunnelEmployee = mongoose.model('TunnelEmployee', tunnelEmployeeSchema);
module.exports = TunnelEmployee;
