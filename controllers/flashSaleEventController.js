const mongoose = require("mongoose");
const FlashSaleEvent = require("../models/FlashSaleEvent");

exports.createFlashSaleEvent = async (req, res) => {
  const { productId, startTime, endTime, availableStock } = req.body;

  try {
    if (!productId) return res.status(400).json({ message: "ProductId is required" });
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }
    if (availableStock <= 0) return res.status(400).json({ message: "Available stock must be at least 1" });
    if (new Date(endTime) <= new Date(startTime)) return res.status(400).json({ message: "Invalid event time range" });

    const event = await FlashSaleEvent.create({
      product: productId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      availableStock,
      soldQuantity: 0,
      isActive: true, 

    });

    await event.populate("product");

    res.status(201).json({ success: true, message: "Flash Sale Event created", event });
  } catch (err) {
    console.error("Flash Sale creation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getFlashSaleEvents = async (req, res) => {
  try {
    const events = await FlashSaleEvent.find()
      .populate("product", "name price") 
      .sort({ startTime: -1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (err) {
    console.error("Flash Sale fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
