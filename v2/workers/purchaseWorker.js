const purchaseQueue = require("../queues/purchaseQueue");
const Product = require("../models/Product");
const Order = require("../models/Order");
const FlashSaleEvent = require("../models/FlashSaleEvent");

purchaseQueue.process(
  5, // number of concurrent jobs
  async (job) => {
    const { userId, eventId, productId, quantity } = job.data;
    console.log(`🛠️ Processing purchase job: ${job.id} by user ${userId}`);

    // event implementation steps:
    // Event verification
    const event = await FlashSaleEvent.findById(eventId);
    if (!event) throw new Error("Flash sale event not found");

    // product validation
    if (!event.product.equals(productId)) {
      throw new Error("Product not part of this flash sale");
    }

    // update stock atomically
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );
    if (!product) throw new Error("Not enough stock available");

    // create order
    const order = await Order.create({
      user: userId,
      product: productId,
      quantity,
      totalPrice: product.price * quantity,
      flashSaleEvent: eventId,
      status: "confirmed"
    });

    console.log(`✅ Order ${order._id} created successfully`);

    // update job progress
    job.progress(100);

    return order;
  }
);

// Event listeners  logging
purchaseQueue.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed: ${err.message}`);
});

purchaseQueue.on("completed", (job, result) => {
  console.log(`🎉 Job ${job.id} completed`);
});
