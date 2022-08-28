
module.exports = function (__runtime__, scope) {
    var threads = Object.create(__runtime__.threads);

    threads.pool = function (options) {
        if(!options) {
            return threads._pool(0, 0, 60 * 1000);
        }
        let corePoolSize = options.corePoolSize;
        let maxPoolSize = options.maxPoolSize;
        let keepAliveTime = options.keepAliveTime;
        if(corePoolSize === undefined) {
            corePoolSize = 0;
        }
        if(maxPoolSize === undefined) {
            maxPoolSize = 0;
        }
        if(keepAliveTime === undefined) {
            keepAliveTime = 60 * 1000;
        }
        return threads._pool(corePoolSize, maxPoolSize, keepAliveTime);
    }

    scope.sync = function (func, lock) {
        lock = lock || null;
        return new org.mozilla.javascript.Synchronizer(func, lock);
    }

    global.Promise.prototype.wait = function () {
        var disposable = threads.disposable();
        this.then(result => {
            disposable.setAndNotify({ result: result });
        }).catch(error => {
            disposable.setAndNotify({ error: error });
        });
        var r = disposable.blockedGet();
        if (r.error) {
            throw r.error;
        }
        return r.result;
    }

    return threads;
}