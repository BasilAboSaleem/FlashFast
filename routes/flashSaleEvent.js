const express = require("express");
const router = express.Router();
const flashSaleEventController = require("../controllers/flashSaleEventController");
const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, flashSaleEventController.createFlashSaleEvent);

router.get("/", flashSaleEventController.getFlashSaleEvents);

module.exports = router;
