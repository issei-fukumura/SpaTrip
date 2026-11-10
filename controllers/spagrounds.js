const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const Spaground = require('../models/spaground');
const { cloudinary } = require('../cloudinary');

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
    const geoData = await maptilerClient.geocoding.forward(
        req.body.spaground.location,
        { limit: 1 }
    );
    const spaground = new Spaground(req.body.spaground);
    spaground.geometry = geoData.features[0].geometry;
    spaground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
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
    const spaground = await Spaground.findByIdAndUpdate(id, { ...req.body.spaground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    spaground.images.push(...imgs);
    await spaground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await spaground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'スパを更新しました');
    res.redirect(`/spagrounds/${spaground._id}`);
}

module.exports.deleteSpaground = async (req, res) => {
    const { id } = req.params;
    await Spaground.findByIdAndDelete(id);
    req.flash('success', 'スパを削除しました');
    res.redirect('/spagrounds');
}


