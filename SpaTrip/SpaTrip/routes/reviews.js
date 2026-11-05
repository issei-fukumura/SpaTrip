const express = require('express')
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const Spaground = require('../models/spaground');
const Review = require('../models/review')
const {reviewSchema} = require('../schemas');



const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body || {});
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


router.post('/', validateReview , catchAsync(async(req,res) => {
    const spaground = await Spaground.findById(req.params.id);
    const review = new Review(req.body.review);
    spaground.reviews.push(review);
    await review.save();
    await spaground.save();
    res.redirect(`/spagrounds/${spaground._id}`)
}));

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Spaground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/spagrounds/${id}`);
}));


module.exports = router;


