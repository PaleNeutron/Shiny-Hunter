
module.exports = function(__runtime__, scope){
    var rtEngines = __runtime__.engines;

    var engines = {};
    var myEngine = rtEngines.myEngine();
    var execArgv = {};
    var execConfig = myEngine.getTag("execution.config");
    putMapTo(execConfig.arguments, execArgv);
    putMapTo(execConfig.scriptArguments, execArgv);
    putJsonMapTo(execConfig.scriptSerializedArguments, execArgv);
    myEngine.execArgv = execArgv;

    engines.execScript = function(name, script, config){
        return rtEngines.execScript(getActivity(), name, script, fillConfig(config));
    }

    engines.execScriptFile = function(path, config){
        return rtEngines.execScriptFile(getActivity(), path, fillConfig(config));
    }

    engines.execAutoFile = function(path, config){
        return rtEngines.execAutoFile(getActivity(), path, fillConfig(config));
    }

    engines.startFloatingController = function(path, config, options) {
        options = options || {};
        return rtEngines.startFloatingController(getActivity(), path, fillConfig(config), !!options.runImmediately);
    }

    engines.myEngine = function(){
        return myEngine;
    }

    engines.all = function(){
        return rtEngines.all();
    }

    engines.stopAll = rtEngines.stopAll.bind(rtEngines);
    engines.stopAllAndToast = rtEngines.stopAllAndToast.bind(rtEngines);

    function fillConfig(c){
        var config = new com.stardust.autojs.execution.ExecutionConfig();
        c = c || {};
        c.path = c.path || files.cwd();
        if(c.path){
           config.workingDirectory = c.path;
        }
        config.delay = c.delay || 0;
        config.interval = c.interval || 0;
        config.loopTimes = (c.loopTimes === undefined)? 1 : c.loopTimes;
        if(c.arguments){
            var arguments = c.arguments;
            for(var key in arguments){
                if(arguments.hasOwnProperty(key)){
                    let value = arguments[key];
                    config.setArgument(key, value, JSON.stringify(value));
                }
            }
        }
        config.projectConfig = myEngine.getTag("execution.config").projectConfig;
        return config;
    }

    function getActivity() {
        if(typeof(activity) == 'undefined') {
            return null;
        }
        return activity;
    }

    function putMapTo(map, obj) {
        var iterator = map.keySet().iterator();
        while(iterator.hasNext()){
            var key = iterator.next();
            obj[key] = map.get(key);
        }
    }
    function putJsonMapTo(map, obj) {
        var iterator = map.keySet().iterator();
        while(iterator.hasNext()){
            var key = iterator.next();
            obj[key] = JSON.parse(map.get(key));
        }
    }

    return engines;
}