const reviewModel = require("../models/reviewModel");
const planModel = require("../models/planModel");

module.exports.getAllReviews = async function getAllReviews(req, res) {
  try {
    const reviews = await reviewModel.find();
    if (reviews) {
      res.json({
        message: "reviews found",
        data: reviews,
      });
    } else {
      res.json({
        message: "reviews not found",
      });
    }
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

module.exports.top3reviews = async function top3reviews(req, res) {
  try {
    const reviews = await reviewModel
      .find()
      .sort({
        rating: -1,
      })
      .limit(3);
    if (reviews) {
      res.json({
        message: "reviews found",
        data: reviews,
      });
    } else {
      res.json({
        message: "reviews not found",
      });
    }
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
};

module.exports.getPlanReviews = async function getPlanReviews(req, res) {
  try {
    const planid = req.params.id;
    console.log("plan id", planid);
    let reviews = await reviewModel.find();

    reviews = reviews.filter((review) => review.plan["_id"] == planid);
    // console.log(reviews);
    return res.json({
      data: reviews,
      message: "reviews retrieved for a particular plan successful",
    });
  } catch (err) {
    return res.json({
      message: err.message,
    });
  }
};

module.exports.createReview = async function createReview(req, res) {
  try {
    const id = req.params.plan;
    let plan = await planModel.findById(id);
    let review = await reviewModel.create(req.body);
    //replace with orig formula
    console.log(plan.ratingsAverage);
    plan.ratingsAverage = (plan.ratingsAverage + req.body.rating) / 2;
    
    await plan.save();
    await review.save();
    res.json({
      message: "review created",
      data: review,
    });
  } catch (err) {
    return res.json({
      message: err.message,
    });
  }
};

module.exports.updateReview = async function updateReview(req, res) {
  try {
    let id = req.params.id;
    let dataToBeUpdated = req.body;
    let keys = [];
    for (let key in dataToBeUpdated) {
      if (key == id) continue;
      keys.push(key);
    }
    let review = await reviewModel.findById(id);
    for (let i = 0; i < keys.length; i++) {
      review[keys[i]] = dataToBeUpdated[keys[i]];
    }
    await review.save();
    return res.json({
      message: "review updated succesfully",
      data: review,
    });
  } catch (err) {
    return res.json({
      message: err.message,
    });
  }
};

module.exports.deleteReview = async function deleteReview(req, res) {
  try {
    let id = req.params.id;
    //update average ratings
    console.log("reviewId", id);
    let review = await reviewModel.findByIdAndDelete(id);
    res.json({
      message: "review deleted",
      data: review,
    });
  } catch (err) {
    return res.json({
      message: err.message,
    });
  }

  //average rating change update
};
