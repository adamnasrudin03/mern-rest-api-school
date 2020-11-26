const { verifySignUp } = require("../middlewares");
const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");

router.post(
  "/auth/signup",
  [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted],
  controller.signup
);
router.post("/auth/signin", controller.signin);

module.exports = router;
