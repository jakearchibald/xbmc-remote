var SimpleJSONStorage = require('../simple-json-storage');

function ServerStorage() {
  SimpleJSONStorage.call(this, 'servers');
}

var ServerStorageProto = ServerStorage.prototype = Object.create(SimpleJSONStorage.prototype);

ServerStorageProto.set = function(name, host, port, httpPort, username, password) {
  this._obj[name] = {
    host: host,
    port: Number(port),
    httpPort: Number(httpPort),
    username: username,
    password: password
  };
  this._save();
};

ServerStorageProto.delete = function(name) {
  delete this._obj[name];
  this._save();
};

module.exports = ServerStorage;