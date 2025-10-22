// routes/product.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, productController.createProduct);

router.get("/", productController.getProducts);

module.exports = router;
