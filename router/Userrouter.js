const express = require("express");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const { UserModel } = require("../model/Usermodel");
const cors = require("cors");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

//   --------------- User Validation ------------->
const signupValidationRules = [
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("userName").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
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

UserRouter.patch("/avatar/:id", upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.params.id;
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const avatarSrc = await uploadOnCloudinary(avatarLocalPath);

    // Update user's avatar in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { avatar: avatarSrc.url || "" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Avatar updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

UserRouter.post(
  "/signup",
  upload.single("avatar"),
 
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { fullName, userName, email, password} = req.body;

      // ==========> For Avtar
      const avatarLocalPath = req.file?.path;

      if (!avatarLocalPath) {
        throw new Error("Image file is required");
      }

      const avatarsrc = await uploadOnCloudinary(avatarLocalPath);
      // ================ Avatar End

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
        const new_user = await UserModel({
          fullName,
          userName,
          email,
          password: hash,
          avatar: avatarsrc.url || ""
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
  }
);

// <-------------- Login ------------>
UserRouter.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    let user_present = await UserModel.findOne({
      email,
    });
    // console.log(user_present);

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
          // console.log(token);
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

// <======= Change Password ============>
  
const saltRounds = 10; // increase salt rounds for stronger hashing

UserRouter.put("/changepassword/:id", async (req, res) => {
    const userId = req.params.id;
    const { currentPass, newPass } = req.body;
    console.log(currentPass,newPass,userId)
    try {
        if (!currentPass || !newPass) {
            return res.status(400).json({ error: "Both current password and new password are required" });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPass, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        const hashedNewPass = await bcrypt.hash(newPass, saltRounds);
        user.password = hashedNewPass;
        await user.save();
        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = {
  UserRouter,
};
