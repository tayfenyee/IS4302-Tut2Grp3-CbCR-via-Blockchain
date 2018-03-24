var LocalStrategy   = require('passport-local').Strategy;

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

//setup connection to local MySQL database
var dbconfig = require('../db-config.js');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {

    // for persistent login sessions

    // serialize user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.mne_id);
    });

    // deserialize user out of the session
    passport.deserializeUser(function(mne_id, done) {
        connection.query("SELECT * FROM mne_info WHERE mne_id = ? ",[mne_id], function(err, rows){
            done(err, rows[0]);
        });
    });

    // passport authentication using local-login
    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, mne_id, password, done) { // callback with MNE ID and password from the login form
            connection.query("SELECT * FROM mne_info WHERE mne_id = ?",[mne_id], function(err, rows){
                if (err)
                    return done(err);

                // user does not exist
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'Oops! User not found.'));
                }

                // incorrect password, hash doesn't match
                if (bcrypt.compareSync(password, rows[0].password)) {
                    return done(null, rows[0]);
                } else {
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                }
            });
        })
    );
};