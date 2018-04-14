const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const request = require('request');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(express.static('public'));

require('./routes/index')(app);

app.set('view engine', 'ejs');

app.listen(3001, function () {
  console.log('Tax Authority portal app listening on port 3001...')
})



