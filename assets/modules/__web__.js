const rhinoApi = com.stardust.autojs.runtime.api.Rhino.INSTANCE;

module.exports = function (runtime, scope) {
    scope.newInjectableWebClient = function () {
        return new com.stardust.autojs.core.web.InjectableWebClient(rhinoApi.currentContext(), scope);
    }

    scope.newInjectableWebView = function (activity) {
        return new com.stardust.autojs.core.web.InjectableWebView(scope.activity, rhinoApi.currentContext(), scope);
    }

    let $web = {
        newWebSocket: function (url, options) {
            options = options || {};
            return new com.stardust.autojs.core.web.WebSocket(http.__okhttp__, url, runtime, options.eventThread == 'this');
        },
        ByteString: Packages.okio.ByteString
    };
    try {
        $web.cookieManager = new com.stardust.autojs.core.web.CookieManager();
    } catch (e) {
        console.warn("Load $web.cookieManager Error", e);
    }
    try {
        $web.webkitCookieJar = new com.stardust.autojs.core.web.SafeWebkitCookieManagerProxy();
    } catch (e) {
        console.warn("Load $web.webkitCookieJar Error", e);
    }
    return $web;
}


