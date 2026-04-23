const mongoose = require('mongoose');

const inventoryTransactionSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    type: {
      //Manage Stock table
      type: String,
      required: true,
      enum: ['Stock In', 'Stock Out', 'Manual Adjustment', 'Harvest Entry'],
    },
    quantity: {
      type: Number,
      required: true,
      // Can be positive or negative
    },
    reference: {
      type: String,
      // E.g. "Expired goods", "Batch A from Tunnel 2"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
module.exports = InventoryTransaction;
