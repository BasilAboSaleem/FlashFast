const mongoose = require("mongoose");
const FlashSaleEvent = require("../models/FlashSaleEvent");
const Order = require("../models/Order");

exports.purchase = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id; // from auth middleware
  const quantity = parseInt(req.body.quantity) || 1;

  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();

    // Attempt to update stock atomically
    const event = await FlashSaleEvent.findOneAndUpdate(
      {
        _id: eventId,
        availableStock: { $gte: quantity },
        startTime: { $lte: now },
        endTime: { $gte: now }
      },
      { $inc: { availableStock: -quantity, soldQuantity: quantity } },
      { new: true, session }
    );

    if (!event) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Stock not sufficient or event not active" });
    }

    // Create the order
    const order = await Order.create(
      [
        {
          user: userId,
          product: event.product,
          quantity,
          status: "confirmed"
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Purchase successful", order: order[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(`Flash Sale Purchase Error | userId: ${userId} | eventId: ${eventId}`, err);
    res.status(500).json({ message: "Server error" });
  }
};
