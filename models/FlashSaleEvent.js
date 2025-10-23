const mongoose = require("mongoose");

const flashSaleEventSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    availableStock: {
      type: Number,
      required: true,
      min: [0, "Available stock cannot be negative"],
    },

    soldQuantity: {
      type: Number,
      default: 0,
      min: [0, "Sold quantity cannot be negative"],
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true, 
    },
  },
  { timestamps: true }
);

// Validate time consistency before saving
flashSaleEventSchema.pre("save", function (next) {
  if (this.startTime >= this.endTime) {
    return next(new Error("Start time must be before end time"));
  }
  next();
});

// Validate also when updating via findOneAndUpdate
flashSaleEventSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate();

  if (update.startTime && update.endTime && update.startTime >= update.endTime) {
    return next(new Error("Start time must be before end time"));
  }

  if (update.availableStock < 0) {
    return next(new Error("Available stock cannot be negative"));
  }

  next();
});

// Helper method to check if event is currently active
flashSaleEventSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
};

// Helper method to safely decrease stock
flashSaleEventSchema.methods.decreaseStock = async function (quantity) {
  if (this.availableStock < quantity) {
    throw new Error("Not enough stock available");
  }

  this.availableStock -= quantity;
  this.soldQuantity += quantity;
  return this.save();
};

module.exports = mongoose.model("FlashSaleEvent", flashSaleEventSchema);
