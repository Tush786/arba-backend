const express = require("express");

const { Category_Model } = require("../model/Categoriesmodel");

const fs = require("fs");
const multer = require("multer");

const cloudinary = require("cloudinary").v2;
require("dotenv").config();


const CategoryRouter = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET_KEY,
  });


CategoryRouter.get("/get", async (req, res) => {
  try {
    const {name,slug,image,owner}=req.body;
    const data = await Category_Model.find({owner:req.body.owner});
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

CategoryRouter.post("/create", upload.single('image'), async (req, res) => {
    try {
        const { name, slug, image,owner } = req.body;
        console.log(req.body)
        // let image = ''; // Declaring image as a let variable
        // const fileBuffer = req.file ? req.file.buffer : null;

        // if (fileBuffer) {
        //     // Generate unique public ID
        //     const timestamp = new Date().getTime();
        //     const uniqueId = Math.floor(Math.random() * 100000);
        //     const publicId = `image_${timestamp}_${uniqueId}`;

        //     // Upload file from buffer to Cloudinary
        //     const result = await cloudinary.uploader.upload(fileBuffer, {
        //         public_id: publicId,
        //         folder: "imageuploadtesting"
        //     });

        //     image = result.url;
        // }

        let data = await Category_Model({ name, slug, image,owner });
        await data.save();
        res.status(201).send({ msg: "New category has been created", data: data });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});


CategoryRouter.patch("/update/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const data = await Category_Model.findOne({ _id: id });
    if (!data) {
      return res.status(404).send({ error: "category not found" });
    }
    if (data.userID !== req.body.userID) {
      return res.status(403).send({ error: "Not authorized" });
    }
    await Category_Model.findByIdAndUpdate(id, req.body);
    res.status(200).send({ msg: `Category with id ${id} has been updated` });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

CategoryRouter.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Category_Model.findOne({ _id: id });
    if (!data) {
      return res.status(404).send({ error: "Category not found" });
    }
    if (data.userID !== req.body.userID) {
      return res.status(403).send({ error: "Not authorized" });
    }
    await Category_Model.findByIdAndDelete(id);
    res.status(200).send({ msg: `Category with id ${id} has been deleted` });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = { CategoryRouter };