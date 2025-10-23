const mongoose = require("mongoose");
const FlashSaleEvent = require("../models/FlashSaleEvent");
const Order = require("../models/Order");
const Product = require("../models/Product"); 

exports.purchase = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  // Validate eventId
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: "Invalid Flash Sale Event ID" });
  }

  const quantity = parseInt(req.body.quantity) || 1;
  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date(); // UTC
    console.log("Purchase Attempt:", { eventId, now, quantity, userId });

    // Attempt to update stock atomically
    const event = await FlashSaleEvent.findOneAndUpdate(
      {
        _id: eventId,
        availableStock: { $gte: quantity },
        startTime: { $lte: now },
        endTime: { $gte: now },
        isActive: true
      },
      { $inc: { availableStock: -quantity, soldQuantity: quantity } },
      { new: true, session }
    );

    if (!event) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Stock not sufficient or event not active" });
    }

    // جلب بيانات المنتج لحساب totalPrice
    const product = await Product.findById(event.product);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Product not found" });
    }
    const totalPrice = product.price * quantity;

    // Create the order
    const order = await Order.create(
      [
        {
          user: userId,
          product: event.product,
          quantity,
          totalPrice, // ✅ إضافة totalPrice
          status: "confirmed"
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Purchase successful", order: order[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(`Flash Sale Purchase Error | userId: ${userId} | eventId: ${eventId}`, err);
    res.status(500).json({ message: "Server error" });
  }
};
