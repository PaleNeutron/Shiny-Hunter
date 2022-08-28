
module.exports = function(runtime, global){
    var floaty = {};

    floaty.window = function(xml){
        if(typeof(xml) == 'xml'){
            xml = xml.toXMLString();
        }
        return wrap(runtime.floaty.window(this, function(context, parent){
             runtime.ui.layoutInflater.setContext(context);
             return runtime.ui.layoutInflater.inflate(xml.toString(), parent, true);
        }));
    }

    floaty.rawWindow = function(xml){
        if(typeof(xml) == 'xml'){
            xml = xml.toXMLString();
        }
        return wrap(runtime.floaty.rawWindow(this, function(context, parent){
             runtime.ui.layoutInflater.setContext(context);
             return runtime.ui.layoutInflater.inflate(xml.toString(), parent, true);
        }));
    }

    function wrap(window){
        var proxyObject = new com.stardust.autojs.core.rhino.ProxyJavaObject(global, window, window.getClass());
        proxyObject.__proxy__ = {
            set: function(name, value){
                window[name] = value;
            },
            get: function(name) {
               var value = window[name];
               if(!value){
                    value = window.findView(name);
               }
               return value;
            }
        };
        return proxyObject;
    }

    floaty.closeAll = runtime.floaty.closeAll.bind(runtime.floaty);

    floaty.checkPermission = runtime.floaty.checkPermission.bind(runtime.floaty);

    floaty.requestPermission = runtime.floaty.requestPermission.bind(runtime.floaty);

    return floaty;
}

