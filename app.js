if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate');
const joi = require('joi')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override')
const path = require('path')
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const helmet = require('helmet')

const mongoSantize = require('express-mongo-sanitize');


const userRoutes = require('./routes/users')
const spagroundRoutes = require('./routes/spagrounds')
const reviewRoutes = require('./routes/reviews')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/SpaTrip'

mongoose.connect(dbUrl)
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: req.query,
        writable: true
    });
    next();
});
app.use(mongoSantize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'mysecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,  // 24時間ごとにセッションを更新
    crypto: {
        secret
    }
});


const sessionConfig = {
    store,  
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

app.use(passport.initialize())
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    'https://cdn.maptiler.com',
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'cdn.maptiler.com',
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.maptiler.com',
    'https://cdn.maptiler.com',
    'https://cdn.jsdelivr.net',
    
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com',
    'https://api.maptiler.com'
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/', userRoutes)
app.use('/spagrounds', spagroundRoutes)
app.use('/spagrounds/:id/reviews', reviewRoutes)






app.use((req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = '問題が起きました' } = err;
    if (!err.message) {
        err.message = '問題が起きました'
    }
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`ポート${port}でリクエスト受付中`);
});















