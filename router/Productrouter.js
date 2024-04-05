const express = require("express");

const { Product_Model } = require("../model/Productmodel");

const productrouter = express.Router();

productrouter.get("/get", async (req, res) => {
  try {
    const data = await Product_Model.find();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
});

productrouter.post("/create", async (req, res) => {
  try {
    const { title, description, price, category, image, owner } = req.body;

    const data = new Product_Model({
      title,
      description,
      price,
      category,
      image,
      owner,
    });
    await data.save();
    res.status(201).send({ msg: "New Product has been created", data: data });
  } catch (error) {
    res.status(400).send({ error: error.message });
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
