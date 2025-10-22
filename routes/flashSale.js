const express = require("express");
const router = express.Router();
const flashSaleController = require("../controllers/flashSaleController");
const authMiddleware = require("../middlewares/auth");

router.post("/:eventId/purchase", authMiddleware, flashSaleController.purchase);

module.exports = router;
