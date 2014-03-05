function SimpleJSONStorage(name) {
  this._name = name;
  this._obj = JSON.parse(localStorage.getItem(name) || '{}');
}

var SimpleJSONStorageProto = SimpleJSONStorage.prototype;

SimpleJSONStorageProto.get = function() {
  return this._obj;
};

SimpleJSONStorageProto.set = function(obj) {
  this._obj = obj;
  this._save();
};

SimpleJSONStorageProto.clear = function(obj) {
  this._obj = {};
  this._save();
};

SimpleJSONStorageProto._save = function() {
  localStorage.setItem(this._name, JSON.stringify(this._obj));
};

module.exports = SimpleJSONStorage;