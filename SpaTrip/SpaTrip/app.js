const express = require('express');
const app = express();
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate');
const joi = require('joi')
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override')
const path = require('path')


const spagroundRoutes = require('./routes/spagrounds')
const reviewRoutes = require('./routes/reviews')


mongoose.connect('mongodb://localhost:27017/SpaTrip')
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });

    
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views') )

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))

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

app.get('/',(req,res) => {
    res.render('home')
})

app.use('/spagrounds',spagroundRoutes)
app.use('/spagrounds/:id/reviews',reviewRoutes)





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















