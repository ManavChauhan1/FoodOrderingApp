const express = require("express");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utility/nodemailer");
require("dotenv").config();

//sign up user function
exports.signup = async function signup(req, res) {
  try {
    let dataObj = req.body;
    console.log(dataObj);
    let user = await userModel.create(dataObj);
    // sendMail("signup", user);
    if (user) {
      return res.json({
        message: "user signed up",
        data: user,
      });
    } else {
      res.json({
        message: "error while signing up",
      });
    }
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

//login user function
exports.login = async function login(req, res) {
  try {
    let data = req.body;
    if (data.email) {
      let user = await userModel.findOne({ email: data.email });
      if (user) {
        //bcrypt -> compare
        if (user.password == data.password) {
          let uid = user["_id"]; //uid
          let token = jwt.sign({ payload: uid }, process.env.JWT_KEY);
          res.cookie("login", token, { httpOnly: true });

          return res.json({
            message: "User has logged in",
            data: user,
          });
        } else {
          return res.json({
            message: "wrong credentials",
          });
        }
      } else {
        return res.json({
          message: "User not found",
        });
      }
    } else {
      return res.json({
        message: "Empty field found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

//isAuthorised middleware-> to check the user's role [admin,user,restaurant,deliveryboy]
module.exports.isAuthorised = function isAuthorised(roles) {
  return function (req, res, next) {
    if (roles.includes(req.role) == true) {
      next();
    } else {
      res.status(401).json({
        message: "operation not allowed",
      });
    }
  };
};

//protectRoute middleware to check if user is logged in and authorized to access
module.exports.protectRoute = async function protectRoute(req, res, next) {
  try {
    let token;
    if (req.cookies.login) {
      console.log(req.cookies);
      token = req.cookies.login;
      let payload = jwt.verify(token, process.env.JWT_KEY);
      if (payload) {
        console.log("payload token", payload);
        const user = await userModel.findById(payload.payload);
        req.role = user.role;
        req.id = user.id;
        console.log(req.role, req.id);
        next();
      } else {
        return res.json({
          message: "please login again",
        });
      }
    } else {
      //browser
      const client = req.get("User-Agent");
      if (client.includes("Mozilla") == true) {
        return res.redirect("/login");
      }
      //postman
      res.json({
        message: "please login",
      });
    }
  } catch (err) {
    return res.json({
      message: err.message,
    });
  }
};

//forgetPassword
module.exports.forgetpassword = async function forgetpassword(req, res) {
  let { email } = req.body;
  try {
    const user = await userModel.findOne({ email: email });
    if (user) {
      //createResetToken is used to create a new token , this is a method defined in userModel
      const resetToken = user.createResetToken();
      // http://abc.com/resetpassword/resetToken
      let resetPasswordLink = `${req.protocol}://${req.get(
        "host"
      )}/resetpassword/${resetToken}`;
      //send email to the user
      //nodemailer
      let obj = {
        resetPasswordLink: resetPasswordLink,
        email: email,
      };
     // sendMail("resetpassword", obj);
      return res.json({
        mesage: "reset password link sent",
        data: resetPasswordLink,
      });
    } else {
      return res.json({
        mesage: "please signup",
      });
    }
  } catch (err) {
    res.status(500).json({
      mesage: err.message,
    });
  }
};

//resetPassword
module.exports.resetpassword = async function resetpassword(req, res) {
  try {
    const token = req.params.token;
    console.log(token);
    let { password, confirmPassword } = req.body;
    const user = await userModel.findOne({ resetToken: token });
    if (user) {
      //resetPasswordHandler will update user's password in db
      user.resetPasswordHandler(password, confirmPassword);
      await user.save();
      res.json({
        message: "password changed succesfully, please login again",
      });
    } else {
      res.json({
        message: "user not found",
      });
    }
  } catch (err) {
    console.log("m hbu errror");
    res.json({
      message: err.message,
    });
  }
};

// logout
// JWT token was checking whether user is logged in or not
// we will undefine login cookie
module.exports.logout = function logout(req, res) {
  // console.log(res.cookies.login);
  res.cookie("login", " ", { maxAge: 1 });
  res.json({
    message: "user logged out succesfully",
  });
};
