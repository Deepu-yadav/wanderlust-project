const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res, next) => {
  let listing = await Listing.findById(req.params.id); 
  let newReview = new Review(req.body.review); 

  newReview.author = res.locals.currentUser._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  console.log("New review saved");

  req.flash("success", "New review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res, next) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  const item = await Review.findByIdAndDelete(reviewId);
  console.log(item);
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};
