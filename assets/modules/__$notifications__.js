module.exports = function (runtime, global) {
    var NotificationCompat = Packages.androidx.core.app.NotificationCompat;
    var ScriptNotification = com.stardust.autojs.core.notification.ScriptNotification;

    function $notifications() {

    }

    var properties = {

    };

    $notifications._build = function (options) {
        let n = ScriptNotification.Companion.buildNotification(context);
        for(let key in options) {
            if(!options.hasOwnProperty(key)) {
                continue;
            }
            let value = options[key];
            applyAttr(n, key, value);
        }
        return n.build();
    }

    $notifications.build = function (options) {
        return new Notification(options);
    }

    function applyAttr(n, key, value) {
        let prop = properties[key];
        if(prop) {
            if(prop.adapter) {
                value = prop.adapter(value);
            }
        }
        key = key.charAt(0).toUpperCase() + key.substring(1);
        n["set" + key].call(n, value);
    }

    function Notification(options) {
        this._options = options;
        let n = $notifications._build(options);
        this.__proto__.__proto__ = new ScriptNotification(context, n, runtime);
    }

    Notification.prototype.update = function (options) {
        this._options = Object.assign(this._options, options);
        this._update($notifications._build(this._options), true);
        return this;
    }

    Notification.prototype.rebuild = function (options) {
        this._options = options;
        this._update($notifications._build(this._options), false);
        return this;
    }

    Notification.prototype.show = function () {
        this._show();
        return this;
    }

    return $notifications;
}