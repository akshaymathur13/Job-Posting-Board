const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Company = require("../models/Company");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const company = new Company({
    name,
    email,
    password: hashedPassword,
  });

  await company.save();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Account Verification",
    text: "Please verify your email.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).json({ message: "Verification email sent" });
  });
});

module.exports = router;

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const company = await Company.findOne({ email });

  if (!company) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, company.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: company._id }, process.env.JWT_SECRET);
  res.status(200).json({ token, company });
});
