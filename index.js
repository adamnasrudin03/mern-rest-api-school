const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

//body parser req json type
app.use(bodyParser.json());

//Running server
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Connection Success", Server is running on port ${PORT}.`);
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to web application." });
});

//Handle error page not found
app.use(function (req, res, next) {
  res.status(404).send({
    message: "Unable to find the requested resource!",
  });
});

//Access CROS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});