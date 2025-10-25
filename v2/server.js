const app = require("./app");
const purchaseQueue = require("./queues/purchaseQueue"); // Queue instance
require("./workers/purchaseWorker"); // jobs

const PORT = process.env.PORT || 3002;

app.listen(PORT, () =>
  console.log(`✅ FlashFast v2 server running on http://localhost:${PORT}`)
);
