const express = require("express");
const router = express.Router();
const { purchaseProduct } = require("../controllers/purchaseController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// POST /api/flashsale/purchase
router.post("/purchase", authMiddleware, roleMiddleware("customer"), purchaseProduct);

module.exports = router;
