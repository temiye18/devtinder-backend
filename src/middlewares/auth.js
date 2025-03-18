const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // Read the token from the cookies
    const { token } = req.cookies;

    // Validate the token
    if (!token) {
      throw new Error("Token is not valid!!!");
    }

    const decodedObj = jwt.verify(token, "DEV@Tinder$790");
    const { _id } = decodedObj;

    // Find the user
    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = {
  userAuth,
};
