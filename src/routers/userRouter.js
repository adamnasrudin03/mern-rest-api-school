const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const controller = require("../controllers/userController");
const { verifySignUp, authJwt } = require("../middlewares");

router.get("/", [authJwt.verifyToken, authJwt.isAdmin], controller.findAll);
router.get("/:id", [authJwt.verifyToken], controller.findById);
router.put(
  "/update/:id",
  [
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password min 8 characters"),
    body("passwordConfirmation").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
    authJwt.verifyToken,
  ],
  controller.updateById
);
router.delete(
  "/delete/:id",
  [authJwt.verifyToken, authJwt.isAdmin],
  controller.deleteById
);

module.exports = router;
