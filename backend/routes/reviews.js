const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviewsForBusiness,
} = require("../controllers/reviewController");

router.post("/", createReview);
router.get("/business/:businessId", getReviewsForBusiness);

module.exports = router;
