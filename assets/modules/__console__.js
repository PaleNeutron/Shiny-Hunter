
module.exports = function (runtime, scope) {
    var rtConsole = runtime.console;
    var console = {};

    console.assert = function (value, message) {
        message = message || "";
        rtConsole.assertTrue(value, message);
    }

    console.rawInput = rtConsole.rawInput.bind(rtConsole);

    console.input = function (data, param) {
        return eval(console.rawInput.call(console, [].slice(arguments)) + "");
    }

    console.log = function () {
        rtConsole.log(util.format.apply(util, arguments));
    }

    console.verbose = function () {
        rtConsole.verbose(util.format.apply(util, arguments));
    }

    console.print = function () {
        rtConsole.print(android.util.Log.DEBUG, util.format.apply(util, arguments));
    }

    console.info = function () {
        rtConsole.info(util.format.apply(util, arguments));
    }

    console.warn = function () {
        rtConsole.warn(util.format.apply(util, arguments));
    }

    console.error = function () {
        rtConsole.error(util.format.apply(util, arguments));
    }

    var timers = {}, ascu = android.os.SystemClock.uptimeMillis;
    console.time = console.time || function (label) {
        label = label || "default";
        timers[label] = ascu();
    }

    console.timeEnd = console.timeEnd || function (label) {
        label = label || "default";
        var result = ascu() - timers[label];
        delete timers[label];
        console.log(label + ": " + result + "ms");
    }

    console.trace = console.trace || function captureStack(message) {
        var k = {};
        Error.captureStackTrace(k, captureStack);
        console.log(util.format.apply(util, arguments) + "\n" + k.stack);
    };

    let GlobalConsole = com.stardust.autojs.core.console.GlobalConsole;
    let Level = org.apache.log4j.Level;
    console.setGlobalLogConfig = function (config) {
        let needConfigure = false;

        if (typeof (config.file) !== 'undefined') {
            GlobalConsole.setFile(files.path(config.file));
            needConfigure = true;
        }
        if (typeof (config.maxFileSize) !== 'undefined') {
            GlobalConsole.setMaxFileSize(config.maxFileSize);
            needConfigure = true;
        }
        if (typeof (config.maxBackupSize) !== 'undefined') {
            GlobalConsole.setMaxBackupIndex(config.maxBackupSize);
            needConfigure = true;
        }
        if (typeof (config.rootLevel) !== 'undefined') {
            let level = Level.toLevel(config.rootLevel.toUpperCase(), null);
            if (level == null) {
                throw new Error("unknown level: " + config.rootLevel);
            }
            GlobalConsole.setRootLevel(level);
            needConfigure = true;
        }
        if (typeof (config.immediateFlush) !== 'undefined') {
            console.warn("console.setGlobalLogConfig() with config 'immediateFlush' is no longer supported.");
        }
        if (typeof (config.filePattern) !== 'undefined') {
            console.warn("console.setGlobalLogConfig() with config 'filePattern' is no longer supported.");
        }
        if (needConfigure) {
            GlobalConsole.configure();
        }
    }

    let Pref = com.stardust.autojs.core.pref.Pref.INSTANCE;
    console.getGlobalLogConfig = function () {
        let level = Level.toLevel(Pref.logRootLevel, Level.ALL);
        return {
            file: GlobalConsole.getLogFilePath(),
            maxFileSize: Pref.logMaxFileSize,
            maxBackupSize: Pref.logMaxBackups,
            rootLevel: level
        };
    }

    console.show = rtConsole.show.bind(rtConsole);
    console.hide = rtConsole.hide.bind(rtConsole);
    console.clear = rtConsole.clear.bind(rtConsole);
    console.setSize = rtConsole.setSize.bind(rtConsole);
    console.setPosition = rtConsole.setPosition.bind(rtConsole);
    console.setTitle = rtConsole.setTitle.bind(rtConsole);

    scope.print = console.print.bind(console);
    scope.log = console.log.bind(console);
    scope.err = console.error.bind(console);
    scope.openConsole = console.show.bind(console);
    scope.clearConsole = console.clear.bind(console);

    return console;
}