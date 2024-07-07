require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 1798;
const bodyParser = require("body-parser");
const route = require("./routes/car");
// const user = require("./routes/user");
const db = require("./db/db");
const cors = require("cors");
const axios = require("axios");
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());
app.use(cors());
app.use("/main", route);
// app.use("/auth", user);
app.get("/", (req, res) => {
  res.json("hello from server");
});


app.listen(port, () => {
  console.log(`server running at ${port}`);
});
