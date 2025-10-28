const purchaseQueue = require("../queues/purchaseQueue");
const Product = require("../models/Product");
const Order = require("../models/Order");
const FlashSaleEvent = require("../models/FlashSaleEvent");

purchaseQueue.process(5, async (job) => {
  const { userId, eventId, productId, quantity } = job.data;
  console.log(`🛠️ Processing purchase job: ${job.id} by user ${userId}`);

  try {
    console.log(`🚀 Job started: ${job.id}`);

    // EVENT VALIDATION
    const event = await FlashSaleEvent.findById(eventId);
    if (!event) throw new Error("Flash sale event not found");

    // PRODUCT VALIDATION 
    if (!event.product.equals(productId)) {
      throw new Error("Product not part of this flash sale");
    }

    // update stock and create order atomically
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
      status: "confirmed",
    });

    console.log(`✅ Order ${order._id} created successfully`);

    //  Socket.io
    if (global.io) {
      global.io.emit("stockUpdate", {
        productId,
        newStock: product.stock,
        message: `📦 Product ${productId} stock updated to ${product.stock}`,
      });
      console.log(`📡 Stock update emitted for product ${productId}`);
    }

    // update progress in Queue
    job.progress(100);

    console.log(`✅ Job completed: ${job.id}`);
    return order;

  } catch (err) {
    console.error(`❌ Job failed ${job.id}: ${err.message}`);
    throw err;
  }
});

// Listeners 
purchaseQueue.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed: ${err.message}`);
});

purchaseQueue.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});
