const { verifySignUp } = require("../middlewares");
const { body } = require("express-validator");
const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");

router.post(
  "/signup",
  [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password min 8 characters"),
    body("passwordConfirmation").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  ],
  controller.signup
);
router.post("/signin", controller.signin);

module.exports = router;
