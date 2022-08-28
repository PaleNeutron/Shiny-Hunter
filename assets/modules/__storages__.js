
module.exports = function(__runtime__, scope){
    var storages = {};
    storages.create = function(name){
        return new LocalStorage(name);
    }

    storages.remove = function(name){
        this.create(name).clear();
    }

    function LocalStorage(name){
        this._storage = new com.stardust.autojs.core.storage.LocalStorage(context, name);
    }
    LocalStorage.prototype.put = function(key, value){
        if(typeof(value) == 'undefined'){
            throw new TypeError('value cannot be undefined');
        }
        this._storage.put(key, JSON.stringify(value));
    }
    LocalStorage.prototype.get = function(key, defaultValue){
        var value = this._storage.getString(key, null);
        if(!value){
            return defaultValue;
        }
        return JSON.parse(value);
    }
    LocalStorage.prototype.remove = function(key){
        this._storage.remove(key);
    }
    LocalStorage.prototype.contains = function(key){
        return this._storage.contains(key);
    }
    LocalStorage.prototype.clear = function(key){
        this._storage.clear();
    }

    return storages;
}

