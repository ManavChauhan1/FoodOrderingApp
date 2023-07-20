const express = require("express");
const { protectRoute } = require("../controller/authController");
const {
  getAllReviews,
  top3reviews,
  getPlanReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controller/reviewController");

const reviewRouter = express.Router();

reviewRouter.route("/all").get(getAllReviews);

reviewRouter.route("/top3").get(top3reviews);

reviewRouter.route("/:id").get(getPlanReviews);

reviewRouter.use(protectRoute);

reviewRouter.route("/crud/:plan").post(createReview);

reviewRouter.route("/crud/:id").patch(updateReview).delete(deleteReview);

module.exports = reviewRouter;
