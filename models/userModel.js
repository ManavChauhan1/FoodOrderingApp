const mongoose = require("mongoose");
require("dotenv").config();
const crypto = require("crypto");
const emailValidator = require("email-validator");

// connecting with database
mongoose
  .connect(process.env.db_link)
  .then((db) => {
    // console.log(db);
    console.log("User DataBase connected.......");
  })
  .catch(function (err) {
    console.log(err);
  });

// user Schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: function () {
      return emailValidator.validate(this.email);
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  confirmPassword: {
    type: String,
    required: true,
    minLength: 8,
    validate: function () {
      return this.confirmPassword == this.password;
    },
  },
  role: {
    type: String,
    enum: ["admin", "user", "restaurantowner", "deliveryboy"],
    default: "user",
  },
  profileImage: {
    type: String,
    // default: "../Images/UserIcon.png",
  },
  resetToken: String,
});

// mongoose hooks
// they are like express middleware
// to do some things before some task
userSchema.pre("save", function () {
  this.confirmPassword = undefined;
});

userSchema.methods.createResetToken = function () {
  //creating unique token using npm i crypto
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetToken = resetToken;
  return resetToken;
};

userSchema.methods.resetPasswordHandler = function (password, confirmPassword) {
  this.password = password;
  this.confirmPassword = confirmPassword;
  this.resetToken = undefined;
};

// creating userModel
const userModel = mongoose.model("userModel", userSchema);
module.exports = userModel;
