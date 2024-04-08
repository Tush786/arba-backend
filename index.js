const express = require("express");
const cors = require("cors");
const { connection } = require("./confige/db");
const { UserRouter } = require("./router/Userrouter");
const multer=require('multer');
const { Authentication } = require("./middleware/Authentication");
const { CategoryRouter } = require("./router/Categoryrouter");
const { productrouter } = require("./router/Productrouter");

require("dotenv").config();
const app = express();
app.use(
  cors({
    origin: "*",
  })
);


app.use(express.json());
app.use("/user", UserRouter)
app.use("/category",Authentication,CategoryRouter)
app.use("/product",Authentication, productrouter)

app.get("/", (req, res) => {
  res.send("this is base api");
});

app.listen(process.env.PORT, async () => {
    try {
      await connection;
      console.log("connected to db successfully");
    } catch (err) {
      console.log(err);
    }
    console.log(`Listening on port ${process.env.PORT}`);
  });