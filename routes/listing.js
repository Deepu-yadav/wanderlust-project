const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");

const listingController = require("../controllers/listingController");
const {
  isLoggedIn,
  isOwner,
  validateListing,
} = require("../middlewares/middleware");

const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });



router.get("/", wrapAsync(listingController.showAllListings))
router
  .route("/listings")
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );


router.get("/listings/new", isLoggedIn, listingController.getNewListing);

router
  .route("/listings/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.get(
  "/listings/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

module.exports = router;
