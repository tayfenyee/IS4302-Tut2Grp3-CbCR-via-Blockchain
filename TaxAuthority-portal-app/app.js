const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const request = require('request');
const session = require('express-session');

const appIRAS = express();

appIRAS.use(bodyParser.urlencoded({ extended: true }));
appIRAS.use(flash());
appIRAS.use(express.static('public'));
appIRAS.use(session({
  secret: 'is4302',
  name: "IRAS",
  resave: false,
  saveUninitialized: false
}));

require('./routes/index')(appIRAS, "IRAS", "3002");

appIRAS.set('view engine', 'ejs');

appIRAS.listen(4002, function () {
  console.log('IRAS Tax Authority portal app listening on port 4002...')
});

const appHMRC = express();

appHMRC.use(bodyParser.urlencoded({ extended: true }));
appHMRC.use(flash());
appHMRC.use(express.static('public'));
appHMRC.use(session({
  secret: 'is4302',
  name: "HMRC",
  resave: false,
  saveUninitialized: false
}));

require('./routes/index')(appHMRC, "HMRC", "3003");

appHMRC.set('view engine', 'ejs');

appHMRC.listen(4003, function () {
  console.log('HMRC Tax Authority portal app listening on port 4003...')
});



