// v2/server.js
const app = require("./app");
const purchaseQueue = require("./queues/purchaseQueue"); // Ensure queue starts processing

const PORT = process.env.PORT || 5002;

app.listen(PORT, () =>
  console.log(`✅ FlashFast v2 server running on http://localhost:${PORT}`)
);
