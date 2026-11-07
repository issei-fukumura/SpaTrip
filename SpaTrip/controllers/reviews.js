const Spaground = require('../models/spaground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const spaground = await Spaground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    spaground.reviews.push(review);
    await review.save();
    await spaground.save();
    req.flash('success', 'レビューを登録しました');
    res.redirect(`/spagrounds/${spaground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Spaground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'レビューを削除しました');
    res.redirect(`/spagrounds/${id}`);
}




