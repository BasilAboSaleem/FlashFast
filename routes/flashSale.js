const express = require("express");
const router = express.Router();
const flashSaleController = require("../controllers/flashSaleController");
const authMiddleware = require("../middlewares/authMiddleware"); 
const roleMiddleware = require("../middlewares/roleMiddleware");  


router.post("/:eventId/purchase", authMiddleware, roleMiddleware("customer"), flashSaleController.purchase);

module.exports = router;
