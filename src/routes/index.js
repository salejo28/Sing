const { Router } = require('express');
const router = Router();

//principal page
router.get('/', (req, res) => {
    res.render('index');
});

//about page
router.get('/about', (req, res) => {
    res.render('about');
});

//in_session home
router.get('/home', (req, res) => {
    res.render('in_session/home');
});

module.exports = router;