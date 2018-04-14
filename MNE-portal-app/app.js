const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('passport');
const expressSession = require('express-session');
const fileUpload = require('express-fileupload');
const request = require('request');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(fileUpload({ safeFileNames: true, preserveExtension: true }));
app.use(expressSession({
  secret: 'is4302',
  resave: true,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

var initPassport = require('./authentication/init');
initPassport(passport);

require('./routes/index')(app, passport);

app.set('view engine', 'ejs');

app.listen(4001, function () {
  console.log('MNE portal app listening on port 4001...')
})



