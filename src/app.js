const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exhbs = require('express-handlebars');
const session = require('express-session');
const mysql_session = require('express-mysql-session');
const passport = require('passport');
const multer = require('multer');
const flash = require('connect-flash');

const { database } = require('./keys');

//initializations
const app = express();
require('./database');
require('./lib/passport');

//settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exhbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

//midlewares
app.use(session({
    secret: 'mysqlnodesession',
    resave: false,
    saveUninitialized: false,
    store: new mysql_session(database)
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/img/upload'),
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + path.extname(file.originalname));
    }
});
app.use(multer({ storage }).single('image'));

//global variables
app.use((req, res, next) => {
    app.locals.danger = req.flash('danger');
    app.locals.success = req.flash('success');
    app.locals.users = req.user;
    next();
});

//routes
app.use(require('./routes/index'));
app.use(require('./routes/autentication'));
app.use(require('./routes/profile'));

//public statics
app.use(express.static(path.join(__dirname, 'public')));


module.exports = app;