
module.exports = function (runtime, scope) {
    var TimedTask = com.stardust.autojs.core.timing.TimedTask;
    var IntentTask = com.stardust.autojs.core.timing.IntentTask;
    var TimedTaskManager = com.stardust.autojs.core.timing.TimedTaskManager.Companion.getInstance();
    var bridges = require("__bridges__");
    function $tasks() {
    }

    function parseConfig(c) {
        let config = new com.stardust.autojs.execution.ExecutionConfig();
        config.delay = c.delay || 0;
        config.interval = c.interval || 0;
        config.loopTimes = (c.loopTimes === undefined) ? 1 : c.loopTimes;
        return config;
    }

    function parseDateTime(clazz, dateTime) {
        if (typeof (dateTime) == 'string') {
            return TimedTask.Companion.parseDateTime(clazz, dateTime);
        } else if (typeof (dateTime) == 'object' && dateTime.constructor === Date) {
            return TimedTask.Companion.parseDateTime(clazz, dateTime.getTime());
        } else if (typeof (dateTime) == 'number') {
            return TimedTask.Companion.parseDateTime(clazz, dateTime);
        } else {
            throw new Error("cannot parse date time: " + dateTime);
        }
    }

    function addTask(task) {
        TimedTaskManager.addTaskSync(task);
    }

    $tasks.addDailyTask = function (task) {
        let localTime = parseDateTime("LocalTime", task.time);
        let timedTask = TimedTask.Companion.dailyTask(localTime, files.path(task.path), parseConfig(task));
        addTask(timedTask);
        return timedTask;
    }

    var daysEn = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    var daysCn = ['一', '二', '三', '四', '五', '六', '日'];

    $tasks.addWeeklyTask = function (task) {
        let localTime = parseDateTime("LocalTime", task.time);
        let timeFlag = 0;
        for (let i = 0; i < task.daysOfWeek.length; i++) {
            let dayString = task.daysOfWeek[i];
            let dayIndex = daysEn.indexOf(dayString.toLowerCase());
            if (dayIndex == -1) {
                dayIndex = daysCn.indexOf(dayString);
            }
            if (dayIndex == -1) {
                throw new Error('unknown day: ' + dayString);
            }
            timeFlag |= TimedTask.Companion.getDayOfWeekTimeFlag(dayIndex + 1);
        }
        let timedTask = TimedTask.Companion.weeklyTask(localTime, new java.lang.Long(timeFlag), files.path(task.path), parseConfig(task));
        addTask(timedTask);
        return timedTask;
    }

    $tasks.addDisposableTask = function (task) {
        let localDateTime = parseDateTime("LocalDateTime", task.date);
        let timedTask = TimedTask.Companion.disposableTask(localDateTime, files.path(task.path), parseConfig(task));
        addTask(timedTask);
        return timedTask;
    }

    var FLAG_ANTI_SHAKE = 1;
    var FLAG_ACTIVITY_INTENT = 2;
    $tasks.addIntentTask = function (task) {
        let intentTask = new IntentTask();
        intentTask.setScriptPath(files.path(task.path));
        task.action && intentTask.setAction(task.action);
        task.dataType && intentTask.setDataType(task.dataType);
        if (task.type === 'activity_intent_task') {
            intentTask.setFlags(FLAG_ACTIVITY_INTENT);
        }
        if (task.action === 'org.autojs.autojs.action.startup') {
            intentTask.setLocal(true);
        }
        if (typeof(task.local) !== 'undefined') {
            intentTask.setLocal(!!task.local);
        }
        addTask(intentTask);
        return intentTask;
    }

    $tasks.addBroadcastIntentTask = function (task) {
        return $tasks.addIntentTask(Object.assign({ type: 'broadcast_intent_task' }, task));
    }

    $tasks.addActivityIntentTask = function (task) {
        return $tasks.addIntentTask(Object.assign({ type: 'activity_intent_task' }, task));
    }

    $tasks.getTimedTask = function (id) {
        return TimedTaskManager.getTimedTask(id);
    }

    $tasks.getIntentTask = function (id) {
        return TimedTaskManager.getIntentTask(id);
    }

    $tasks.removeIntentTask = function (id) {
        let task = $tasks.getIntentTask(id);
        return task && TimedTaskManager.removeTaskSync(task);
    }

    $tasks.removeTimedTask = function (id) {
        let task = $tasks.getTimedTask(id);
        return task && TimedTaskManager.removeTaskSync(task);
    }

    $tasks.queryTimedTasks = function (options, callback) {
        var sql = '';
        var args = [];
        options = options || {};
        function sqlAppend(str) {
            if (sql.length == 0) {
                sql += str;
            } else {
                sql += ' AND ' + str;
            }
            return true;
        }
        options.path && sqlAppend('script_path = ?') && args.push(options.path);
        return bridges.toArray(TimedTaskManager.queryTimedTasks(sql ? sql : null, args));
    }

    $tasks.queryIntentTasks = function (options, callback) {
        var sql = '';
        var args = [];
        options = options || {};
        function sqlAppend(str) {
            if (sql.length == 0) {
                sql += str;
            } else {
                sql += ' AND ' + str;
            }
            return true;
        }
        options.path && sqlAppend('script_path = ?') && args.push(options.path);
        options.action && sqlAppend('action = ?') && args.push(options.action);
        return bridges.toArray(TimedTaskManager.queryIntentTasks(sql ? sql : null, args));
    }

    return $tasks;
}
