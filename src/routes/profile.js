const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const validator = require("validator");
const bcrypt = require("bcrypt");
const {
  validateEditProfileData,
  validatePasswordData,
} = require("../utils/validation");

profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({ data: user });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}'s profile updated successfully`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

profileRouter.patch("/password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    const isOldPasswordValid = await user.validatePassword(oldPassword);
    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new Error("All fields are required");
    } else if (!isOldPasswordValid) {
      throw new Error("Old password is incorrect");
    } else if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Please enter a strong password");
    } else if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(req.body?.newPassword, 10);

    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
