module.exports = function(runtime, scope){
    let Database = com.stardust.autojs.core.database.Database;
    let Cursor = android.database.Cursor;

    function sqlite() {
    };

    sqlite.__typeAdapter__ = ({
        toContentValues: function (values) {
            let contentValues = new android.content.ContentValues();
            for(let key in values) {
                if(!values.hasOwnProperty(key)) {
                    continue;
                }
                let value = values[key];
                if(typeof(value) == 'number') {
                    if(Number.isInteger(value)) {
                        contentValues.put(key, new java.lang.Long(value));
                    } else {
                        contentValues.put(key, new java.lang.Double(value));
                    }
                } else {
                    contentValues.put(key, value);
                }
            }
            return contentValues;
        },
        wrapCursor: function (cursor) {
            let c = Object.create(cursor);
            c.get = function(index) {
                switch(cursor.getType(index)) {
                    case Cursor.FIELD_TYPE_NULL:
                        return null;
                    case Cursor.FIELD_TYPE_INTEGER:
                        return cursor.getLong(index);
                    case Cursor.FIELD_TYPE_FLOAT:
                        return cursor.getDouble(index);
                    case Cursor.FIELD_TYPE_STRING:
                        return cursor.getString(index);
                    case Cursor.FIELD_TYPE_BLOB:
                        return cursor.getBlob(index);
                }
            };
            c.getByColumn = function(column) {
                let i = cursor.getColumnIndexOrThrow(column);
                return c.get(i);
            };
            c.all = function(close) {
                if(typeof(close) == 'undefined') {
                    close = true;
                }
                let result = [];
                while(cursor.moveToNext()) {
                    result.push(c.pick());
                }
                if(close) {
                    cursor.close();
                }
                return result;
            };
            c.pick = function() {
                let names = cursor.getColumnNames();
                let n = cursor.getColumnCount();
                let result = {};
                for(let i = 0; i < n; i++) {
                    result[names[i]] = c.get(i);
                }
                return result;
            };
            c.next = function() {
                if(cursor.moveToNext()) {
                    return c.pick();
                }
                return null;
            };
            c.single = function() {
                let result = null;
                if(cursor.moveToNext()) {
                   result = c.pick();
                }
                cursor.close();
                return result;
            };
            return c;
        }
    });

    sqlite.open = function(name, options, callback) {
        options = options || {};
        let version = options.version || 1;
        let readOnly = !!options.readOnly;
        callback = callback || null;
        let database = new Database(runtime.context, runtime, name, version, readOnly, callback, sqlite.__typeAdapter__);
        return database;
    }

    return sqlite;
}

