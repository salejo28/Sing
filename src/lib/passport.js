const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('../lib/helpers');

//REGISTRO EN LA APP
passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, password, done) => {

    const user = await pool.query('SELECT * FROM users WHERE username = ? ', [username]);
    if (user.length > 0) {
        done(null, false, req.flash('danger', 'The username is alredy exist'));
    } else {
        const { fullname } = req.body;
        const newUser = {
            username,
            password,
            fullname
        };

        newUser.password = await helpers.encryptPassword(password);
        const result = await pool.query('INSERT INTO users SET ?', [newUser]);
        newUser.id = result.insertId;
        return done(null, newUser);
    }

}));
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
});

//login
passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.password);
        if (validPassword) {
            done(null, user, req.flash('success', 'Welcome ' + user.username));
        } else {
            done(null, false, req.flash('danger', 'Password incorrect'))
        }
    } else {
        return done(null, false, req.flash('danger', 'The username does no exists'));
    }
}));