const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  const { name, price, stock } = req.body;
  try {
    const product = await Product.create({ name, price, stock });
    res.json({ message: "Product created", product });
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ count: products.length, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
