const express = require("express");
const app = express();
const session = require("express-session");
const {apiV1} = require('/routes/index.js')

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
app.use((req,res)=>{
  return res.status(404).send("Page not found");
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});


