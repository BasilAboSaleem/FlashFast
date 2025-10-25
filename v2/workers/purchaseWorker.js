const purchaseQueue = require("../queues/purchaseQueue");
const Product = require("../models/Product");
const Order = require("../models/Order");
const FlashSaleEvent = require("../models/FlashSaleEvent");

purchaseQueue.process(
  5, //count of concurrent jobs
  async (job) => {
    const { userId, eventId, productId, quantity } = job.data;
    console.log(`🛠️ Processing purchase job: ${job.id} by user ${userId}`);

    // 1. event validation
    const event = await FlashSaleEvent.findById(eventId);
    if (!event) throw new Error("Flash sale event not found");

    // 2. product validation
    if (!event.products.includes(productId))
      throw new Error("Product not part of this flash sale");

    // 3. stock deduction (atomic)
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );
    if (!product) throw new Error("Not enough stock available");

    // 4.   create order
    const order = await Order.create({
      user: userId,
      products: [{ product: productId, quantity }],
      totalAmount: product.price * quantity,
      flashSaleEvent: eventId,
    });

    console.log(`✅ Order ${order._id} created successfully`);

    // 5. update progress 
    job.progress(100);

    return order;
  }
);

//  Event listeners for logging
purchaseQueue.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed: ${err.message}`);
});

purchaseQueue.on("completed", (job, result) => {
  console.log(`🎉 Job ${job.id} completed`);
});
