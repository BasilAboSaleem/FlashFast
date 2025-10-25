const purchaseQueue = require("../queues/purchaseQueue");

// send job to Queue
exports.purchaseProduct = async (req, res) => {
  try {
    const { eventId, productId, quantity } = req.body;
    const userId = req.user._id; 

    if (!eventId || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    //add job for Queue
    const job = await purchaseQueue.add({ userId, eventId, productId, quantity });

    res.status(200).json({
      message: "Purchase request submitted successfully",
      jobId: job.id
    });
  } catch (err) {
    console.error("PurchaseController Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
