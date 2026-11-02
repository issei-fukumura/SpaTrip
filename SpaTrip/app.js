const express = require('express');
const app = express();
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate');
const { spagroundSchema , reviewSchema} = require('./schemas');
const joi = require('joi')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override')
const path = require('path')
const Spaground = require('./models/spaground');
const Review = require('./models/review')


mongoose.connect('mongodb://localhost:27017/SpaTrip')
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateSpaground = (req, res, next) => {
    const { error } = spagroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body || {});
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views') )

app.get('/',(req,res) => {
    res.render('home')
})

app.get('/spagrounds',catchAsync(async(req,res) => {
    const spagrounds = await Spaground.find({});
    res.render('spagrounds/index', {spagrounds});
}));

app.get('/spagrounds/new',(req,res) => {
    res.render('spagrounds/new');
})

app.post('/spagrounds', validateSpaground ,catchAsync(async(req,res) => {
    // if(!req.body.Spaground) throw new ExpressError('不正なキャンプ場のデータです',404);
    const spaground = new Spaground(req.body.spaground);
    await spaground.save();
    res.redirect(`/spagrounds/${spaground.id}`);
}));

app.get('/spagrounds/:id/edit',catchAsync(async(req,res) => {
    const spaground = await Spaground.findById(req.params.id)
    res.render('spagrounds/edit',{spaground})
}));

app.put('/spagrounds/:id', validateSpaground ,catchAsync(async(req,res) => {
    const {id} = req.params;
    const spaground = await Spaground.findByIdAndUpdate(id, {...req.body.spaground })
    res.redirect(`/spagrounds/${spaground.id}`)
}));

app.delete('/spagrounds/:id',catchAsync(async(req,res) => {
    const {id} = req.params;
    await Spaground.findByIdAndDelete(id)
    res.redirect(`/spagrounds`)
}));

app.get('/spagrounds/:id',catchAsync(async(req,res) => {
    const spaground = await Spaground.findById(req.params.id).populate('reviews')
    res.render('spagrounds/show',{spaground})
}));

app.post('/spagrounds/:id/reviews', validateReview , catchAsync(async(req,res) => {
    const spaground = await Spaground.findById(req.params.id);
    const review = new Review(req.body.review);
    spaground.reviews.push(review);
    await review.save();
    await spaground.save();
    res.redirect(`/spagrounds/${spaground._id}`)
}));

app.delete('/spagrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Spaground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/spagrounds/${id}`);
}));

app.use((req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500,message='問題が起きました' } = err;
    if (!err.message) {
        err.message = '問題が起きました'
    }
    res.status(statusCode).render('error', { err });
});

app.listen(3000,()=>{
    console.log('ポート3000でリクエスト受付中')
})















