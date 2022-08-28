

module.exports = function (runtime, scope) {

    var ShellOptions = com.stardust.autojs.core.shell.ShellOptions;

    scope.SetScreenMetrics = function (w, h) {
        runtime.setScreenMetrics(w, h);
    }

    function withAdbOrRootShell(cb) {
        if (shell._default_options && shell._default_options.adb) {
            let sh = new Shell({
                root: false,
                adb: true
            });
            cb(sh);
            sh.exitAndWaitFor();
        } else {
            let sh = shell._root_sh;
            if (!sh) {
                sh = new Shell({
                    root: true
                });
                shell._root_sh = sh;
                events.on("exit", () => {
                    shell._root_sh && shell._root_sh.exit();
                })
            }
            cb(sh);
        }
    }

    scope.Tap = function (x, y) {
        withAdbOrRootShell(sh => {
            sh.Tap(x, y);
        });
    }

    scope.Swipe = function (x1, y1, x2, y2, duration) {
        if (arguments.length == 5) {
            withAdbOrRootShell(sh => {
                sh.Swipe(x1, y1, x2, y2, duration);
            });
        } else {
            withAdbOrRootShell(sh => {
                sh.Swipe(x1, y1, x2, y2);
            });
        }
    }

    scope.Screencap = function (path) {
        withAdbOrRootShell(sh => {
            sh.Screencap(path);
        });
    }

    scope.KeyCode = function (keyCode) {
        withAdbOrRootShell(sh => {
            sh.KeyCode(keyCode);
        });
    }

    scope.Home = function () {
        return KeyCode(3);
    }

    scope.Back = function () {
        return KeyCode(4);
    }

    scope.Power = function () {
        return KeyCode(26);
    }

    scope.Up = function () {
        return KeyCode(19);
    }

    scope.Down = function () {
        return KeyCode(20);
    }

    scope.Left = function () {
        return KeyCode(21);
    }

    scope.Right = function () {
        return KeyCode(22);
    }

    scope.OK = function () {
        return KeyCode(23);
    }

    scope.VolumeUp = function () {
        return KeyCode(24);
    }

    scope.VolumeDown = function () {
        return KeyCode(25);
    }

    scope.Menu = function () {
        return KeyCode(1);
    }

    scope.Camera = function () {
        return KeyCode(27);
    }

    scope.Text = function (text) {
        withAdbOrRootShell(sh => {
            sh.Text(text);
        });
    }

    scope.Input = scope.Text;

    function shell(cmd, options) {
        if (typeof (options) == 'boolean') {
            options = { root: options };
        }
        return runtime.shell(cmd, shell._getShellOptions(options));
    }

    shell.setDefaultOptions = function (options) {
        this._default_options = options;
        runtime.defaultShellOptions = new ShellOptions(!!options.root, !!options.adb);
    }

    shell.isRootAvailable = function () {
        return Shell.Companion.isRootAvailable();
    }

    shell.checkAccess = function (type) {
        return Shell.Companion.checkAccess(type);
    }

    shell._getShellOptions = function (options) {
        options = options || {};
        if (shell._default_options) {
            options = Object.assign(shell._default_options, options);
        }
        return new ShellOptions(!!options.root, !!options.adb);
    }

    return shell;
}
