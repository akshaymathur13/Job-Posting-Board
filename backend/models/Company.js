const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Company", companySchema);
