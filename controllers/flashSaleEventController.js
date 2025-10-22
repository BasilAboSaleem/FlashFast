const FlashSaleEvent = require("../models/FlashSaleEvent");

exports.createFlashSaleEvent = async (req, res) => {
  const { productId, startTime, endTime, availableStock } = req.body;
  try {
    const event = await FlashSaleEvent.create({
      product: productId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      availableStock,
      soldQuantity: 0
    });
    res.json({ message: "Flash Sale Event created", event });
  } catch (err) {
    console.error("Flash Sale creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFlashSaleEvents = async (req, res) => {
  try {
    const events = await FlashSaleEvent.find().populate("product");
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
