const express = require("express");
const path = require("path");
const { Product_Model } = require("../model/Productmodel");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const fs = require("fs");
const multer = require("multer");
const uploadMiddleware = require("../middleware/multer");
const upload = multer({ dest: "allimages/" });

const productrouter = express.Router();

productrouter.get("/get", async (req, res) => {
  try {
    const { sort } = req.query;
    const { owner } = req.body; // Corrected to extract 'sort' from query parameters

    let sortObj = {}; // Initialize sort object

    // Check if 'sort' query parameter is provided and set sort criteria accordingly
    if (sort) {
      if (sort === "asc") {
        sortObj["price"] = 1;
      } else if (sort === "desc") {
        sortObj["price"] = -1;
      }
    }

    // Fetch products from database with optional sorting
    const products = await Product_Model.find({ owner: req.body.owner }).sort(
      sortObj
    );

    res.status(200).send(products); // Send sorted products
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

productrouter.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category, owner } = req.body;
    console.log(req.body);
    const imageLocalPath = req.file?.path;

    console.log(imageLocalPath);
    if (!imageLocalPath) {
      throw new Error("Image file is required");
    }

    const imagescr = await uploadOnCloudinary(imageLocalPath);

    // Create new product in database
    const newProduct = new Product_Model({
      title,
      description,
      price,
      category,
      image: imagescr.url || "", // If upload to Cloudinary failed, use an empty string as the image URL
      owner,
    });
    await newProduct.save();
    return res
      .status(201)
      .json({ msg: "New Product has been created", newProduct });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

productrouter.patch("/update/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product_Model.findOne({ _id: id });
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }
    if (product.userID !== req.body.userID) {
      return res.status(403).send({ error: "Not authorized" });
    }

    let updateData = req.body;

    if (req.file) {
      // If a new image file is provided, upload it to Cloudinary
      const imageLocalPath = req.file?.path;
      const imageSrc = await uploadOnCloudinary(imageLocalPath);
      updateData.image = imageSrc.url;
    }

    await Product_Model.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).send({ msg: `Product with id ${id} has been updated` });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

productrouter.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Product_Model.findOne({ _id: id });
    if (!data) {
      return res.status(404).send({ error: "Product not found" });
    }
    if (data.userID !== req.body.userID) {
      return res.status(403).send({ error: "Not authorized" });
    }
    await Product_Model.findByIdAndDelete(id);
    res.status(200).send({ msg: `Product with id ${id} has been deleted` });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = { productrouter };
