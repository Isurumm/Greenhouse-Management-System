const mongoose = require('mongoose');

const polytunnelSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a polytunnel name'],
    },
    size: {
      type: String,
      required: [true, 'Please define the size (e.g. 50x100 ft)'],
    },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Fallow'],
      default: 'Active',
    },
    cropType: {
       type: String,
       required: false,
    }
  },
  {
    timestamps: true,
  }
);

const Polytunnel = mongoose.model('Polytunnel', polytunnelSchema);
module.exports = Polytunnel;
