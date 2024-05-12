const express = require("express");
const path = require("path");
const { Product_Model } = require("../model/Productmodel");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const fs=require('fs')
const multer = require('multer');
const upload = multer({ dest: 'allimages/' });

const productrouter = express.Router();

productrouter.get("/get", async (req, res) => {
  try {
    const { owner } = req.body;
    const data = await Product_Model.find({ owner: req.body.owner });
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

productrouter.post("/create",  upload.single("image"), async (req, res) => {
  // try {
  //   const { title, description, price, category, image, owner } = req.body;

  //   const data = new Product_Model({
  //     title,
  //     description,
  //     price,
  //     category,
  //     image,
  //     owner,
  //   });
  //   await data.save();
  //   res.status(201).send({ msg: "New Product has been created", data: data });
  // } catch (error) {
  //   res.status(400).send({ error: error.message });
  // }

  // ==================> Above code is full fuctional but i am trying image uploading with cloudinary ==========>

  try {
    const { title, description, price, category, owner } = req.body;
    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
      throw new Error("Image file is required");
    }

    const imagescr = await uploadOnCloudinary(imageLocalPath);

    // Create new product in database
    const newProduct = await Product_Model.create({
      title,
      description,
      price,
      category,
      image: imagescr.url || "", // If upload to Cloudinary failed, use an empty string as the image URL
      owner,
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

productrouter.patch("/update/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Product_Model.findOne({ _id: id });
    if (!data) {
      return res.status(404).send({ error: "Product not found" });
    }
    if (data.userID !== req.body.userID) {
      return res.status(403).send({ error: "Not authorized" });
    }
    await Product_Model.findByIdAndUpdate(id, req.body);
    res.status(200).send({ msg: `Product with id ${id} has been updated` });
  } catch (error) {
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
