const User = require("../models/user");

module.exports.showSignUpForm = (req, res) => {
  res.render("users/signup");
};

module.exports.postSignUp = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (error) => {
      if (error) {
        return next(error);
      }
      req.flash("success", "Registered Successfully! Welcome to AirBnB Clone.");
      res.redirect("/");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/signup");
  }
};

module.exports.showLoginForm = (req, res, next) => {
  res.render("users/login.ejs");
};

module.exports.postLogin = async (req, res, next) => {
  req.flash("success", "Welcome back to AirBnB Clone!");
  

  const redirectUrl = res.locals.redirectUrl
    ? res.locals.redirectUrl
    : "/";

  if (redirectUrl.includes("/reviews")) {
    const modifiedUrl = redirectUrl.replace("/reviews", "");
    res.redirect(modifiedUrl);
  } else {
    res.redirect(redirectUrl);
  }
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/");
  });
};
