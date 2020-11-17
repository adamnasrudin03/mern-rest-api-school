const express = require("express");

const app = express();
const router = express.Router();

//Running server
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Connection Success", Server is running on port ${PORT}.`);
});

router.use("/welcome", (req, res, next) => {
  res.status(200).send({
    message: "Welcome !",
  });
  next();
});
app.use("/", router);

//Handle error page not found
app.use(function (req, res, next) {
  res.status(404).send({
    message: "Unable to find the requested resource!",
  });
});
