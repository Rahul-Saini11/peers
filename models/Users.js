const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please also tell your name"], //options known as validator
  },
  email: {
    type: String,
    required: [true, "Please provide your email"], //options known as validator
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: Date,
});

const Users = mongoose.model("User", userSchema);

module.exports = Users;
