const express = require("express");

const app = express();

app.use("/hello", (req, res) => {
  res.send("Hello hello hello!");
});
app.use("/test", (req, res) => {
  res.send("Hello from Express!");
});

app.use("/", (req, res) => {
  res.send("Hello from the dashboardddd!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
