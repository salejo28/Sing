const { Router } = require('express');
const router = Router();
const cloudinary = require('cloudinary');
const fs = require('fs-extra');

const pool = require('../database');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

//config cloudinary
cloudinary.config({
    cloud_name: 'dn4vndboa',
    api_key: '727132184185271',
    api_secret: 'h2EXpXPq3Iuvtaq-zQFTExKVsD0'
});

//profile
router.get('/profile', isLoggedIn, async(req, res) => {
    const photo = await pool.query('SELECT * FROM photo WHERE user_id = ?', [req.user.id]);
    res.render('in_session/profile', { photo });
});

router.post('/profile', isLoggedIn, async(req, res) => {
    const row = await pool.query('SELECT * FROM photo WHERE user_id = ?', [req.user.id]);
    if (row.length > 0) {
        try {
            const updateResult = await cloudinary.v2.uploader.upload(req.file.path);
            const updatePhoto = {
                imageURL: updateResult.url,
                public_id: updateResult.public_id,
                user_id: req.user.id
            }
            const update = await pool.query('UPDATE photo set ? WHERE user_id = ?', [updatePhoto, req.user.id]);
            updatePhoto.id = update.id;
            fs.unlink(req.file.path);
            res.redirect('/profile');
            return updatePhoto;
        } catch (error) {
            console.log(error);
        }
    } else {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path);
            const newPhoto = {
                imageURL: result.url,
                public_id: result.public_id,
                user_id: req.user.id
            }
            const consult = await pool.query('INSERT INTO photo SET ?', [newPhoto]);
            newPhoto.id = consult.id;
            fs.unlink(req.file.path);
            res.redirect('/profile');
            return newPhoto;
        } catch (error) {
            console.log(error);
        }
    }
});

module.exports = router;