const FlashSaleEvent = require("../models/FlashSaleEvent");
const Order = require("../models/Order");

exports.purchase = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id; // from auth middleware
  const quantity = parseInt(req.body.quantity) || 1;

  try {
    // Check flash sale and available stock
    const event = await FlashSaleEvent.findOneAndUpdate(
      { _id: eventId, availableStock: { $gte: quantity }, startTime: { $lte: new Date() }, endTime: { $gte: new Date() } },
      { $inc: { availableStock: -quantity, soldQuantity: quantity } },
      { new: true }
    );

    if (!event) {
      return res.status(400).json({ message: "Stock not sufficient or event not active" });
    }

    // Create order
    const order = await Order.create({
      user: userId,
      product: event.product,
      quantity,
      status: "confirmed"
    });

    res.json({ message: "Purchase successful", order });
  } catch (err) {
    console.error("Flash Sale Purchase Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
