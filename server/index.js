var express = require('express');
var swig = require('swig');

var app = express();

app.engine('html', swig.renderFile);
app.set('view cache', false);
swig.setDefaults({ cache: false });

app.use('/static', express.static(__dirname + '/../www/static'));

app.get('/', function(req, res) {
  res.render('../www/index.html');
});

module.exports = app;