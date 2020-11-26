const express = require("express");
const bodyParser = require("body-parser");
const db = require("./src/models");

const app = express();
const Role = db.role;

const studentRouter = require("./src/routers/studentRouter");
const teacherRouter = require("./src/routers/teacherRouter");
const lessonRouter = require("./src/routers/lessonRouter");

//body parser req json type
app.use(bodyParser.json());

function initialRole() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "admin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
//Running server
const PORT = process.env.PORT || 8082;
db.mongoose
  .connect("mongodb://localhost:27017/school")
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Connection Success", Server is running on port ${PORT}.`)
    );
    // initialRole();
  })
  .catch((err) => {
    console.log("Error name : ", err.name);
    console.log("Error messages : ", err.message);
  });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to web application." });
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

//Route
app.use("/students", studentRouter);
app.use("/teachers", teacherRouter);
app.use("/lessons", lessonRouter);

//Handle error page not found
app.use(function (req, res, next) {
  res.status(404).send({
    message: "Unable to find the requested resource!",
  });
});

//Handle Error
app.use((error, req, res, next) => {
  const status = error.errorStatus || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).send({ message: message, data: data });
});
