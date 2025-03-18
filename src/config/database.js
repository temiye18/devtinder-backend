const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://temiye:EkNJvqhIZCUGPBrt@devtinder.fit8i.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
