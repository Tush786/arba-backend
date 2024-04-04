const express = require("express");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const { UserModel } = require("../model/Usermodel");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const { body, validationResult }=require('express-validator')
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const storage = multer.memoryStorage();

const upload = multer({ storage });
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET_KEY,
  });

//   --------------- User Validation ------------->
  const signupValidationRules = [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('userName').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ];

const UserRouter = express.Router();
UserRouter.get("/", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

UserRouter.get("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await UserModel.find({
      _id,
    });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

UserRouter.post("/signup", upload.single('avatar'),signupValidationRules, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

      const { fullName, userName, email, password } = req.body;
      const fileBuffer = req.file ? req.file.buffer : null; // Check if avatar is uploaded
  
    //   <-------------------Cloudinary Code For avatar upload ----------------------->
      let profileImageUrl = '';
  
      // If avatar is uploaded, upload it to Cloudinary
      if (fileBuffer) {
        // Generate unique public ID
        const timestamp = new Date().getTime();
        const uniqueId = Math.floor(Math.random()*100000);
        const publicId = `image_${timestamp}_${uniqueId}`;
  
        // Upload file from buffer to Cloudinary
        const result = await cloudinary.uploader.upload_stream(
          { 
            public_id: publicId,
            folder: "imageuploadtesting"
          },
          (err, result) => {
            if (err) throw err;
            return result;
          }
        ).end(fileBuffer);
  
        profileImageUrl = result.url;
      }
    //   <--------------------------- End Cloudinary---------------->
  
      // Check if email already exists
      const userPresent = await UserModel.findOne({ email });
  
      if (userPresent) {
        return res.status(409).send("Email already exists in database");
      }
  
      // Hash the password
      bcrypt.hash(password, 4, async function (err, hash) {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).send("Internal Server Error");
          }
        const new_user = await  UserModel({
            fullName,
            userName,
          email,
          password: hash,
          avatar:profileImageUrl
        });
        await new_user.save();
        res.status(200).send({
          msg: "User Added Successfully",
        });
      });
    } catch (error) {
      console.error("Error in signup:", error);
      return res.status(500).send("Internal Server Error");
    }
  });


// <-------------- Login ------------>
UserRouter.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    let user_present = await UserModel.findOne({
      email,
    });
    console.log(user_present);
    
      if (!user_present) {
        res.status(409).send("Email Does not exist!");
      } else if (user_present) {
        const hash_pass = await user_present.password;
        bcrypt.compare(req.body.password, hash_pass, function (err, result) {
          if (result) {
            const token = jwt.sign(
              { userId: user_present._id },
              process.env.SECRET_KEY
            );
            console.log(token);
            res
              .status(200)
              .send({ message: "Login successfully", token, user_present });
          } else {
            res.status(410).send("Login failed, invalid credentials");
          }
        });
      }
    
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

UserRouter.patch("/editUser/:id", async (req, res) => {
  try {
    const currUser = await UserModel.findByIdAndUpdate(req.params.id, {
      ...req.body,
    });
    res.status(200).send({
      msg: "User Updated Successfully",
      user: currUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = {
  UserRouter,
};
