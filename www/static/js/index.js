var Promise = require('rsvp').Promise;
var XBMCSocket = require('./xbmc-socket');

var xbmc = new XBMCSocket('ws://127.0.0.1:9090/jsonrpc');

document.querySelector('.right').addEventListener('click', function(event) {
  xbmc.ready().then(function() {
    return xbmc.inputRight();
  }).then(function(data) {
    console.log("Done!", data);
  }).catch(function(data) {
    console.error(data);
  });
});

document.querySelector('.play').addEventListener('click', function(event) {
  xbmc.ready().then(function() {
    return xbmc.playerOpenUrl("htps://bbcredux.com/asset/media/5984830768826782563/1-1393853462-0548ad9b06c01286530dd233bff7772a/h264_mp4_hi_v1.1/20140226-220000-inside-no-9-h264lg.mp4");
  }).then(function(data) {
    console.log("Done!", data);
  }).catch(function(data) {
    console.error(data);
  });
});
