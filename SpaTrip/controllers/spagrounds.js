// const Spaground = require('../models/spaground')
// ;
// module.exports.index = async (req, res) => {
//     const spagrounds = await Spaground.find({});
//     res.render('spagrounds/index', { spagrounds });
// }


// module.exports.renderNewForm = (req,res) => {
//     res.render('spagrounds/new');
// }



const Spaground = require('../models/spaground');

module.exports.index = async (req, res) => {
    const spagrounds = await Spaground.find({});
    res.render('spagrounds/index', { spagrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('spagrounds/new');
}

module.exports.showSpaground = async (req, res) => {
    const spaground = await Spaground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
    if (!spaground) {
        req.flash('error', 'スパは見つかりませんでした');
        return res.redirect('/spagrounds');
    }
    res.render('spagrounds/show', { spaground });
}

module.exports.createSpaground = async (req, res) => {
    // if (!req.body.spaground) throw new ExpressError('不正なキャンプ場のデータです', 400);
    const spaground = new Spaground(req.body.spaground);
    spaground.author = req.user._id;
    await spaground.save();
    req.flash('success', '新しいスパを登録しました');
    res.redirect(`/spagrounds/${spaground._id}`);
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const spaground = await Spaground.findById(id);
    if (!spaground) {
        req.flash('error', 'スパは見つかりませんでした');
        return res.redirect('/spagrounds');
    }

    res.render('spagrounds/edit', { spaground });
}

module.exports.updateSpaground = async (req, res) => {
    const { id } = req.params;

    const camp = await Spaground.findByIdAndUpdate(id, { ...req.body.spaground });
    req.flash('success', 'スパを更新しました');
    res.redirect(`/spagrounds/${camp._id}`);
}

module.exports.deleteSpaground = async (req, res) => {
    const { id } = req.params;
    await Spaground.findByIdAndDelete(id);
    req.flash('success', 'スパを削除しました');
    res.redirect('/spagrounds');
}


