const express = require("express");
const router = express.Router();
const { getMyOrders } = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/my", authMiddleware, getMyOrders);

module.exports = router;
