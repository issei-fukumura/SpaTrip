const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Spaground = require('../models/spaground');
const {spagroundSchema} = require('../schemas');

const validateSpaground = (req, res, next) => {
    const { error } = spagroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


router.get('/',catchAsync(async(req,res) => {
    const spagrounds = await Spaground.find({});
    res.render('spagrounds/index', {spagrounds});
}));

router.get('/new',(req,res) => {
    res.render('spagrounds/new');
})

router.post('/', validateSpaground ,catchAsync(async(req,res) => {
    // if(!req.body.Spaground) throw new ExpressError('不正なキャンプ場のデータです',404);
    const spaground = new Spaground(req.body.spaground);
    await spaground.save();
    res.redirect(`/spagrounds/${spaground.id}`);
}));

router.get('/:id/edit',catchAsync(async(req,res) => {
    const spaground = await Spaground.findById(req.params.id)
    res.render('spagrounds/edit',{spaground})
}));

router.put('/:id', validateSpaground ,catchAsync(async(req,res) => {
    const {id} = req.params;
    const spaground = await Spaground.findByIdAndUpdate(id, {...req.body.spaground })
    res.redirect(`/spagrounds/${spaground.id}`)
}));

router.delete('/:id',catchAsync(async(req,res) => {
    const {id} = req.params;
    await Spaground.findByIdAndDelete(id)
    res.redirect(`/spagrounds`)
}));

router.get('/:id',catchAsync(async(req,res) => {
    const spaground = await Spaground.findById(req.params.id).populate('reviews')
    res.render('spagrounds/show',{spaground})
}));

module.exports = router;