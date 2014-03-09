var express = require('express');
var swig = require('swig');

var app = express();

app.engine('html', swig.renderFile);
app.set('view cache', false);
swig.setDefaults({ cache: false });

app.use('/xbmc-remote/static', express.static(__dirname + '/../www/static'));

app.get('/xbmc-remote/', function(req, res) {
  res.render('../www/index.html');
});

app.get('/xbmc-remote/tv/', function(req, res) {
  res.render('../www/tv/index.html');
});

module.exports = app;