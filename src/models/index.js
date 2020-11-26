const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./userModel");
db.role = require("./userRoleModel");
db.student = require("./studentModel");
db.lesson = require("./lessonModel");
db.teacher = require("./teacherModel");

db.ROLES = ["user", "admin"];

module.exports = db;
