const express = require("express");
const Job = require("../models/Job");
const jwt = require("jsonwebtoken");
const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.company = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

router.post("/post-job", auth, async (req, res) => {
  const { title, description, experienceLevel } = req.body;

  const newJob = new Job({
    title,
    description,
    experienceLevel,
    postedBy: req.company.id,
  });

  await newJob.save();
  res.status(201).json(newJob);
});

module.exports = router;

router.post("/send-email", auth, async (req, res) => {
  const { emailList, jobDetails } = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: emailList.join(","),
    subject: "Job Alert",
    text: `Job Title: ${jobDetails.title}\nDescription: ${jobDetails.description}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).json({ message: "Emails sent successfully" });
  });
});
