const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { listingSchema } = require("../schema");
const { reviewSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  console.log("req originalUrl", req.originalUrl);
  console.log("req.user ==> ", req.user);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; 
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {

  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};


module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing.owner._id.equals(res.locals.currentUser._id)) {
    req.flash("error", "You don't have permission to modify this listing!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review.author._id.equals(res.locals.currentUser._id)) {
    req.flash(
      "error",
      "You can't delete this review as you are not the author of this!"
    );
    return res.redirect(`/listings/${id}`);
  }

  next();
};


module.exports.validateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body); 

  console.log("Validation Schema using Joi: ", result);

  if (result.error) {
    let errMessage = result.error.details.map((el) => el.message).join(",");

    throw new ExpressError(400, errMessage);
  } else {
    next();
  }
};


module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body); 

  if (error) {
    let errMessage = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMessage);
  } else {
    next();
  }
};
