const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const authRouter = require("./routes/auth");
const requestRouter = require("./routes/request");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const http = require("http");
const initializeSocket = require("./utils/socket");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    // allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/request", requestRouter);
app.use("/profile", profileRouter);
app.use("/user", userRouter);
app.use("/chat", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connection established...");

    server.listen(process.env.PORT || 7777, () => {
      console.log(`Server is running on port ${process.env.PORT || 7777}`);
    });
  })
  .catch((err) => {
    console.log("Database connection cannot be established...");
  });
