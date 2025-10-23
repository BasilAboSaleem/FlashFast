const express = require("express");
const router = express.Router();
const flashSaleEventController = require("../controllers/flashSaleEventController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("admin"), flashSaleEventController.createFlashSaleEvent);

router.get("/", flashSaleEventController.getFlashSaleEvents);

module.exports = router;
