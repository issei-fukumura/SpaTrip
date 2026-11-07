const express = require('express');
const router = express.Router();
const spagrounds = require('../controllers/spagrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateSpaground } = require('../middleware');
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(spagrounds.index))
    .post(isLoggedIn,upload.array('image', 5) ,validateSpaground,catchAsync(spagrounds.createSpaground));

router.get('/new', isLoggedIn, spagrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(spagrounds.showSpaground))
    .put(isLoggedIn, isAuthor, upload.array('image', 5), validateSpaground, catchAsync(spagrounds.updateSpaground))
    .delete(isLoggedIn, isAuthor,catchAsync(spagrounds.deleteSpaground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(spagrounds.renderEditForm));

module.exports = router;












