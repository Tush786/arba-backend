const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { UserModel } = require("../model/Usermodel");

dotenv.config();

const Forgetpassrouter = express.Router();

// Route to handle "forgot password" request
Forgetpassrouter.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;

  // Check if email exists in the database
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetToken = resetToken;
  await user.save();

  // Send email with reset token
  const resetUrl = `https://arba-tau.vercel.app/resetpassword?token=${resetToken}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: "tusharsapate34@gmail.com",
    to: email,
    subject: "Reset Password",
    html: `<h1>Reset Password</h1><h2>Click on the link to reset your password</h2><h3>${resetUrl}</h3>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "A link to reset your password has been sent to your email.",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send reset email" });
  }
});

// Route to handle password reset
Forgetpassrouter.post("/resetPassword", async (req, res) => {
  const { token, password } = req.body;

  // Verify reset token
  const user = await UserModel.findOne({ resetToken: token });
  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }

  // Update password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetToken = null;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
});

module.exports = {
  Forgetpassrouter,
};
