const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);

    // Encrypt password
    const { firstName, lastName, emailId, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    //  Create a JWT TOKEN
    const token = savedUser.getJWT();

    // Add token the cookie and send it to the client
    res.cookie("token", token, {
      expires: new Date(Date.now() + 86400000), // 1 day
    });
    res.json({ message: "User Signup successful", data: savedUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      //  Create a JWT TOKEN
      const token = user.getJWT();

      // Add token the cookie and send it to the client
      res.cookie("token", token, {
        expires: new Date(Date.now() + 86400000), // 1 day
      });
      res.json({ message: "Login successful!!!", data: user });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logged out successfully");
});

module.exports = authRouter;
