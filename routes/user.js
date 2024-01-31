const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares/middleware");

const userController = require("../controllers/userController");


router
  .route("/signup")
  .get(userController.showSignUpForm)
  .post(wrapAsync(userController.postSignUp));



router
  .route("/login")
  .get(userController.showLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      
      failureRedirect: "/login",
      failureFlash: true, 
    }),
    userController.postLogin
  );



router.get("/logout", userController.logout);

module.exports = router;
