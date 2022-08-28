
module.exports = function (runtime, global) {

    function $debug() {
    }

    $debug.dumpHprof = function dumpHprofData(file) {
        android.os.Debug.dumpHprofData($files.path(file));
    }

    $debug.dumpAndSendHprof = function dumpAndSendHprof(file) {
        if (typeof(file) === 'undefined') {
            file = "./dump.hprof.zip"
        }
        let tmpFile = './tmp.hprof';
        file = $files.path(tmpFile);
        $debug.dumpHprof(tmpFile);
        $files.remove(file);
        $zip.zipFile(tmpFile, file, {
            compressionLevel: 9
        });
        $files.remove(tmpFile);
        $app.startActivity({
            action: "android.intent.action.SEND",
            data: $app.getUriForFile(file),
        });
    }

    $debug.getStackTrace = function getStackTrace(e) {
        return runtime.getStackTraceOfAnyError(e);
    }

    $debug.gc = function gc() {
        java.lang.Runtime.getRuntime().gc();
    }

    $debug.setMemoryLeakDetectionEnabled  = function(enabled) {
        com.stardust.autojs.core.debug.Debug.INSTANCE.setMemoryLeakDetectionEnabled(enabled);
    }

    return $debug;
}