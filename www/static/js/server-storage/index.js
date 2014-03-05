var SimpleJSONStorage = require('../simple-json-storage');

function ServerStorage() {
  SimpleJSONStorage.call(this, 'servers');
}

var ServerStorageProto = ServerStorage.prototype = Object.create(SimpleJSONStorage.prototype);

ServerStorageProto.set = function(name, host, port) {
  this._obj[name] = {
    host: host,
    post: Number(port)
  };
  this._save();
};

module.exports = ServerStorage;