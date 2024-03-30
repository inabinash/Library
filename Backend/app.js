const express = require("express");
const app = express();
const session = require("express-session");
const { apiV1 } = require("./routes/index.js");
const mongoose = require("mongoose");
const UserModel  = require("./Models/User.js")

require("dotenv").config();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: true,
  })
);

app.use("/v1", apiV1);

//Requested URL doesn't start with /v1 hence path doesn't exist in server
app.use((req, res) => {
  return res.status(404).send("Page not found");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});


const start = async () => {
  const res= mongoose.connect(
    // "mongodb+srv://admin:admin@librarydb.uiyfrlv.mongodb.net/?retryWrites=true&w=majority&appName=libraryDB"
    process.env.DB_URI
  ).then(async () => {
    const admin = await UserModel.findOne({ username: "admin" })
    // console.log("Admin :", admin);
    if (admin == null) {
      await UserModel.create({ username: "admin", password: "admin", role: "admin" })
      // console.log("Admin :", admin);
    }
    const guest = await UserModel.findOne({ username: "guest" })
    if (guest == null) {
      await UserModel.create({ username: "guest", password: "guest", role: "guest" })
    }
  });

  // console.log("res: " ,res);
  app.listen(8080, function() {
    console.log("Server listening at Port 8080");
  });
};

start();