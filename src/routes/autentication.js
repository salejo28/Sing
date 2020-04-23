const { Router } = require('express');
const router = Router();


const passport = require('passport');
const pool = require('../database');

const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

//Registro
router.get('/signup', isNotLoggedIn, (req, res) => {
    res.render('form/signup');
});

router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true

}));

//login
router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('form/login');
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

//logout
router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    res.redirect('/login');
});

module.exports = router;