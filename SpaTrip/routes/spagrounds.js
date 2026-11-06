const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Spaground = require('../models/spaground');
const {spagroundSchema} = require('../schemas');
const { isLoggedIn} = require('../middleware');


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

router.get('/new',isLoggedIn,(req,res) => {
    res.render('spagrounds/new');
})

router.post('/',isLoggedIn ,validateSpaground ,catchAsync(async(req,res) => {
    // if(!req.body.Spaground) throw new ExpressError('不正なキャンプ場のデータです',404);
    const spaground = new Spaground(req.body.spaground);
    await spaground.save();
    req.flash('success','新しいスパを登録しました')
    res.redirect(`/spagrounds/${spaground.id}`);
}));

router.get('/:id/edit',isLoggedIn ,catchAsync(async(req,res) => {
    const spaground = await Spaground.findById(req.params.id)
    if(!spaground){
        req.flash('error','スパは見つかりませんでした');
        return res.redirect('/spagrounds');
    }
    res.render('spagrounds/edit',{spaground})
}));

router.put('/:id', isLoggedIn ,validateSpaground ,catchAsync(async(req,res) => {
    const {id} = req.params;
    const spaground = await Spaground.findByIdAndUpdate(id, {...req.body.spaground })
    req.flash('success','スパを更新しました')
    res.redirect(`/spagrounds/${spaground.id}`)
}));

router.delete('/:id',isLoggedIn ,catchAsync(async(req,res) => {
    const {id} = req.params;
    await Spaground.findByIdAndDelete(id)
    req.flash('success','スパを削除しました')
    res.redirect(`/spagrounds`)
}));

router.get('/:id',catchAsync(async(req,res) => {
    const spaground = await Spaground.findById(req.params.id).populate('reviews')
    if(!spaground){
        req.flash('error','スパは見つかりませんでした');
        return res.redirect('/spagrounds');
    }
    res.render('spagrounds/show',{spaground})
}));

module.exports = router;