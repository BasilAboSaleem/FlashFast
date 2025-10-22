const mongoose = require("mongoose");

const flashSaleEventSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  availableStock: { type: Number, required: true },
  soldQuantity: { type: Number, default: 0 },
});

module.exports = mongoose.model("FlashSaleEvent", flashSaleEventSchema);
