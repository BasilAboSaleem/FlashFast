const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const purchaseQueue = require("./queues/purchaseQueue"); // Queue instance
require("./workers/purchaseWorker"); // jobs


const server = http.createServer(app);

// config socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// io global
global.io = io;

const PORT = process.env.PORT || 3002;

server.listen(PORT, () =>
  console.log(`✅ FlashFast v2 server running on http://localhost:${PORT}`)
);
