
module.exports = function (runtime, scope) {
    var timers = Object.create(runtime.timers);
    scope.__asGlobal__(timers, ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'setImmediate', 'clearImmediate']);

    scope.loop = function () {
        console.warn("loop() has been deprecated and has no effect. Remove it from your code.");
    }

    let functions = ['addDailyTask', 'addWeeklyTask', 'addDisposableTask', 'addIntentTask', 'getTimedTask', 'getIntentTask',
    'removeIntentTask', 'removeTimedTask', 'queryIntentTasks', 'queryTimedTasks'];
    functions.forEach(func => {
        timers[func] = function() {
            return $work_manager[func].apply($work_manager, arguments);
        }
    });

    return timers;
}
