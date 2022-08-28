module.exports = function (runtime, global) {

    require("object-observe-lite.min")();
    require("array-observe.min")();

    var J = util.java;
    var ui = {};

    ui.__widgets__ = {};

    ui.__defineGetter__("emitter", () => activity ? activity.getEventEmitter() : null);

    ui.layout = function (xml) {
        if (typeof (activity) == 'undefined') {
            throw new Error("需要在ui模式下运行才能使用该函数");
        }
        runtime.ui.layoutInflater.setContext(activity);
        var view = runtime.ui.layoutInflater.inflate(xml, activity.window.decorView, false);
        ui.setContentView(view);
    }

    ui.R = new com.stardust.autojs.core.rhino.ProxyObject();
    var R = {};
    var aaptPackageName = typeof (activity) !== 'undefined' ? activity.aaptPackageName : null;
    ui.R.__proxy__ = {
        get: function (type) {
            if (!R[type]) {
                R[type] = new com.stardust.autojs.core.rhino.ProxyObject();
                R[type].__proxy__ = {
                    get: function (name) {
                        let ctx = typeof (activity) !== 'undefined' ? activity : context;
                        let id = aaptPackageName ? ctx.resources.getIdentifier(name, type, aaptPackageName) : 0;
                        return id == 0 ? ctx.resources.getIdentifier(name, type, ctx.packageName) : id;
                    }
                };
            }
            return R[type];
        }
    };

    ui.useAndroidResources = function (args) {
        runtime.requiresApi(26);
        args = args || "";
        var projectConfig = engines.myEngine().getTag("execution.config").projectConfig;
        if (!projectConfig.androidResources) {
            throw new Error("Must specify correct 'androidResources' field in project.json");
        }
        let resDir = files.path(projectConfig.androidResources.resDir);
        var isRelease = projectConfig && projectConfig.buildInfo && projectConfig.buildInfo.isRelease();
        if (isRelease) {
            activity.resourcesPath = files.join(resDir, "resources.ap_");
            return;
        }
        let resOut = files.path("build/res_generated");
        let manifest = files.path(projectConfig.androidResources.manifest);
        let aapt2 = runtime.getProperty("aapt2");
        if (!aapt2) {
            throw Error("no aapt2 available");
        }
        files.ensureDir(resOut);
        var projectConfig = engines.myEngine().getTag("execution.config").projectConfig;
        var result = aapt2.aapt2(resDir, manifest, resOut, aaptPackageName, args);
        result.throwOnError();
        activity.resourcesPath = files.join(resOut, "resources.ap_");
    }

    ui.layoutFile = function (file) {
        if (activity.layoutFile(file)) {
            ui.view = activity.view;
            return;
        }
        ui.layout(files.read(file));
    }

    function inflate(ctx, xml, parent, attachToParent) {
        if (typeof (xml) === 'number') {
            return android.view.LayoutInflater.from(ctx).inflate(xml, parent, attachToParent);
        }
        if (typeof (xml) === 'xml') {
            xml = xml.toXMLString();
        }
        parent = parent || null;
        attachToParent = !!attachToParent;
        runtime.ui.layoutInflater.setContext(ctx);
        return runtime.ui.layoutInflater.inflate(xml.toString(), parent, attachToParent);
    }

    ui.inflate = function (xml, parent, attachToParent) {
        let ctx;
        if (typeof (activity) == 'undefined') {
            ctx = runtime.ui.helper.wrapWithTheme(context, 'ScriptTheme');
        } else {
            ctx = activity;
        }
        return inflate(ctx, xml, parent, attachToParent);
    }

    ui.__inflate__ = function (inflateCtx, xml, parent, attachToParent) {
        if (typeof (xml) == 'xml') {
            xml = xml.toXMLString();
        }
        parent = parent || null;
        attachToParent = !!attachToParent;
        return runtime.ui.layoutInflater.inflate(inflateCtx, xml.toString(), parent, attachToParent);
    }

    ui.registerWidget = function (name, widget) {
        if (typeof (widget) !== 'function') {
            throw new TypeError('widget should be a class-like function');
        }
        ui.__widgets__[name] = widget;
    }

    ui.setContentView = function (view) {
        ui.view = view;
        ui.run(function () {
            activity.setContentView(view);
        });
    }

    ui.findById = function (id) {
        if (!ui.view)
            return null;
        return ui.findByStringId(ui.view, id);
    }

    ui.findView = function (id) {
        return ui.findById(id);
    }

    ui.isUiThread = function () {
        let Looper = android.os.Looper;
        return Looper.myLooper() == Looper.getMainLooper();
    }

    ui.run = function (action) {
        if (ui.isUiThread()) {
            return action();
        }
        var err = null;
        var result;
        var disposable = global.threads.disposable();
        runtime.uiHandler.post(function () {
            try {
                result = action();
                disposable.setAndNotify(true);
            } catch (e) {
                err = e;
                disposable.setAndNotify(true);
            }
        });
        disposable.blockedGet();
        if (err) {
            throw err;
        }
        return result;
    }

    ui.post = function (action, delay) {
        if (delay == undefined) {
            runtime.getUiHandler().post(wrapUiAction(action));
        } else {
            runtime.getUiHandler().postDelayed(wrapUiAction(action), delay);
        }
    }

    ui.statusBarColor = function (color) {
        if (typeof (color) == 'string') {
            color = android.graphics.Color.parseColor(color);
        }
        activity.setStatusBarColor(color);
    }

    ui.finish = function () {
        ui.run(function () {
            activity.finish();
        });
    }

    ui.findByStringId = function (view, id) {
        return com.stardust.autojs.core.ui.JsViewHelper.findViewByStringId(view, id);
    }

    runtime.ui.bindingContext = global;
    var layoutInflater = runtime.ui.layoutInflater;
    layoutInflater.setLayoutInflaterDelegate({
        beforeConvertXml: function (context, xml) {
            return null;
        },
        afterConvertXml: function (context, xml) {
            return xml;
        },
        afterInflation: function (context, result, xml, parent) {
            return result;
        },
        beforeInflation: function (context, xml, parent) {
            return null;
        },
        beforeInflateView: function (context, node, parent, attachToParent) {
            return null;
        },
        afterInflateView: function (context, view, node, parent, attachToParent) {
            let widget = view.widget;
            if (widget && context.get("root") != widget) {
                widget.notifyAfterInflation(view);
            }
            return view;
        },
        beforeCreateView: function (context, node, viewName, parent, attrs) {
            if (ui.__widgets__.hasOwnProperty(viewName)) {
                let Widget = ui.__widgets__[viewName];
                let widget = new Widget();
                let ctx = layoutInflater.newInflateContext();
                ctx.put("root", widget);
                ctx.put("widget", widget);
                let viewOrXml = widget.renderInternal();
                if (viewOrXml instanceof android.view.View) {
                    this.afterCreateView(ctx, viewOrXml, node, viewName, parent, attrs);
                    return viewOrXml;
                }
                let view = ui.__inflate__(ctx, viewOrXml, parent, false);
                return view;
            };
            return null;
        },
        afterCreateView: function (context, view, node, viewName, parent, attrs) {
            var className = view.getClass().getName();
            if (className === "com.stardust.autojs.core.ui.widget.JsListView" ||
                className == "com.stardust.autojs.core.ui.widget.JsGridView") {
                initListView(view);
            } else if (className == "com.stardust.autojs.core.ui.widget.JsWebView") {
                initWebView(view);
            }
            var widget = context.get("widget");
            if (widget != null) {
                widget.view = view;
                view.widget = widget;
                let viewAttrs = com.stardust.autojs.core.ui.ViewExtras.getViewAttributes(view, layoutInflater.resourceParser);
                viewAttrs.setViewAttributeDelegate({
                    has: function (name) {
                        return widget.hasAttr(name);
                    },
                    get: function (view, name, getter) {
                        return widget.getAttr(view, name, getter);
                    },
                    set: function (view, name, value, setter) {
                        widget.setAttr(view, name, value, setter);
                    }
                });
                widget.notifyViewCreated(view);
            }
            return view;
        },
        beforeApplyAttributes: function (context, view, inflater, attrs, parent) {
            return false;
        },
        afterApplyAttributes: function (context, view, inflater, attrs, parent) {
            context.remove("widget");
        },
        beforeInflateChildren: function (context, inflater, node, parent) {
            return false;
        },
        afterInflateChildren: function (context, inflater, node, parent) {

        },
        afterApplyPendingAttributesOfChildren: function (context, inflater, view) {

        },
        beforeApplyPendingAttributesOfChildren: function (context, inflater, view) {
            return false;
        },
        beforeApplyAttribute: function (context, inflater, view, ns, attrName, value, parent, attrs) {
            var isDynamic = layoutInflater.isDynamicValue(value);
            if ((isDynamic && layoutInflater.getInflateFlags() == layoutInflater.FLAG_IGNORES_DYNAMIC_ATTRS)
                || (!isDynamic && layoutInflater.getInflateFlags() == layoutInflater.FLAG_JUST_DYNAMIC_ATTRS)) {
                return true;
            }
            value = bind(value);
            let widget = context.get("widget");
            if (widget != null && widget.hasAttr(attrName)) {
                widget.setAttr(view, attrName, value, (view, attrName, value) => {
                    inflater.setAttr(view, ns, attrName, value, parent, attrs);
                });
            } else {
                inflater.setAttr(view, ns, attrName, value, parent, attrs);
            }
            this.afterApplyAttribute(context, inflater, view, ns, attrName, value, parent, attrs);
            return true;
        },
        afterApplyAttribute: function (context, inflater, view, ns, attrName, value, parent, attrs) {

        }
    });

    function bind(value) {
        var ctx = runtime.ui.bindingContext;
        if (ctx == null)
            return;
        var i = -1;
        while ((i = value.indexOf("{{", i + 1)) >= 0) {
            var j = value.indexOf("}}", i + 1);
            if (j < 0)
                return value;
            value = value.substring(0, i) + evalInContext(value.substring(i + 2, j), ctx) + value.substring(j + 2);
            i = j + 1;
        }
        return value;
    }

    function evalInContext(expr, ctx) {
        return global.__exitIfError__(function () {
            with (ctx) {
                return (function () {
                    return eval(expr);
                }).call(ctx);
            }
        });
    }

    function initListView(list) {
        list.setDataSourceAdapter({
            getItemCount: function (data) {
                return data.length;
            },
            getItem: function (data, i) {
                return data[i];
            },
            setDataSource: function (data) {
                var adapter = list.getAdapter();
                Array.observe(data, function (changes) {
                    changes.forEach(change => {
                        if (change.type == 'splice') {
                            if (change.removed && change.removed.length > 0) {
                                adapter.notifyItemRangeRemoved(change.index, change.removed.length);
                            }
                            if (change.addedCount > 0) {
                                adapter.notifyItemRangeInserted(change.index, change.addedCount);
                            }
                        } else if (change.type == 'update') {
                            try {
                                adapter.notifyItemChanged(parseInt(change.name));
                            } catch (e) { }
                        }
                    });
                });
            }
        });
    }

    let JsBridge = (() => {
        const ResultAdapter = require("result_adapter");

        const EVENT_RESPONSE = "$autojs:internal:response:";
        const EVENT_REQUEST = "$autojs:internal:request";
        function JavaScriptBridgeImpl(webview) {
            var _this = this;
            $events.__asEmitter__(_this);
            _this.nextId = 1;
            _this.requestHandlers = new Map();
            _this.webview = webview;
            webview.setJavascriptEventCallback({
                onWebJavaScriptEvent: (event, args) => {
                    let obj = unwrapJson(args) || [];
                    _this.emit.apply(_this, [event, { name: event }].concat(obj));
                },
            });
            _this.on(EVENT_REQUEST, function (e, request) {
                var _a;
                var handler = (_a = _this.requestHandlers.get(request.channel)) !== null && _a !== void 0 ? _a : _this.requestHandlers.get('');
                if (!handler) {
                    _this.sendResponseError(request, new Error("no handler for action: " + request.channel));
                    return;
                }
                var event = {
                    channel: request.channel,
                    arguments: request.args,
                };
                var result;
                try {
                    result = handler.apply(void 0, [event].concat(event.arguments));
                }
                catch (e) {
                    _this.sendResponseError(request, e);
                    return;
                }
                if (isPromise(result)) {
                    result.then(function (r) {
                        _this.sendResponse(request, r);
                    }).catch(function (err) {
                        _this.sendResponseError(request, err);
                    });
                }
                else {
                    _this.sendResponse(request, result);
                }
            });
            return _this;
        }
        JavaScriptBridgeImpl.prototype.sendResponse = function (request, result, error) {
            this.send(EVENT_RESPONSE + request.id, {
                result: result,
                error: error
            });
        };
        JavaScriptBridgeImpl.prototype.sendResponseError = function (request, error) {
            this.sendResponse(request, undefined, error.toString());
        };
        JavaScriptBridgeImpl.prototype.invoke = function (channel) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var id = this.nextId++;
            return new Promise(function (resolve, reject) {
                _this.once(EVENT_RESPONSE + id, function (event, result) {
                    if (result.error) {
                        reject(new Error('Error occurred while handling invoke: channel = ' + channel + ', error = ' + result.error));
                    }
                    else {
                        resolve(result.result);
                    }
                });
                _this.send(EVENT_REQUEST, {
                    id: id,
                    channel: channel,
                    args: args
                });
            });
        };
        JavaScriptBridgeImpl.prototype.send = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.webview.sendEventToWebJavaScript(event, wrapJson(args));
        };
        JavaScriptBridgeImpl.prototype.handle = function (channel, handler) {
            this.requestHandlers.set(channel !== null && channel !== void 0 ? channel : '', handler);
            return this;
        };
        JavaScriptBridgeImpl.prototype.eval = function (code) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _b = (_a = JSON).parse;
                            return [4 /*yield*/, ResultAdapter.promise(this.webview.__eval(code))];
                        case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                    }
                });
            });
        };
        function __awaiter(thisArg, _arguments, P, generator) {
            function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
            return new (P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
                function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
                function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };
        function unwrapJson(maybeJson) {
            if (!maybeJson) {
                return undefined;
            }
            return JSON.parse(maybeJson);
        }
        function wrapJson(obj) {
            if (typeof (obj) === 'undefined') {
                return undefined;
            }
            return JSON.stringify(obj);
        }
        function isPromise(obj) {
            return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
        }
        return JavaScriptBridgeImpl;
    })();

    function initWebView(webview) {
        webview.jsBridge = new JsBridge(webview);
        var emitter = $events.emitter();
        webview.events = emitter;
        webview.setSyncWebViewEventCallback({
            onSyncWebViewEvent: (event) => {
                dispatchJavaEvent(event, emitter);
            },
        });
        webview.setSyncEventEnabled('', true);

        function dispatchJavaEvent(event, emitter) {
            const eventName = event.getName();
            const args = Array.from(event.getArguments());
            let _returnValue;
            let returnValueSet = false;
            const e = {
                name: eventName,
                arguments: args,
                consumed: false,
            };
            Object.defineProperty(e, 'returnValue', {
                get: function () {
                    return _returnValue;
                },
                set: function (value) {
                    _returnValue = value;
                    returnValueSet = true;
                }
            })
            emitter.emit.apply(emitter, [eventName, e].concat(args));
        }
    }

    function wrapUiAction(action, defReturnValue) {
        if (typeof (activity) != 'undefined') {
            return function () { return action(); };
        }
        return function () {
            return __exitIfError__(action, defReturnValue);
        }
    }

    ui.Widget = (function () {
        function Widget() {
            this.__attrs__ = {};
        }
        Widget.prototype.renderInternal = function () {
            if (typeof (this.render) === 'function') {
                return this.render();
            }
            return (< />)
        };
        Widget.prototype.defineAttr = function (attrName, getter, setter) {
            var attrAlias = attrName;
            var applier = null;
            if (typeof (arguments[1]) == 'string') {
                attrAlias = arguments[1];
                if (arguments.length >= 3) {
                    applier = arguments[2];
                }
            } else if (typeof (arguments[1]) == 'function' && typeof (arguments[2]) != 'function') {
                applier = arguments[1];
            }
            if (!(typeof (arguments[1]) == 'function' && typeof (arguments[2]) == 'function')) {
                getter = () => {
                    return this[attrAlias];
                };
                setter = (view, attrName, value, setter) => {
                    this[attrAlias] = value;
                    applier && applier(view, attrName, value, setter);
                };
            }
            this.__attrs__[attrName] = {
                getter: getter,
                setter: setter
            };
        };
        Widget.prototype.hasAttr = function (attrName) {
            return this.__attrs__.hasOwnProperty(attrName);
        };
        Widget.prototype.setAttr = function (view, attrName, value, setter) {
            this.__attrs__[attrName].setter(view, attrName, value, setter);
        };
        Widget.prototype.getAttr = function (view, attrName, getter) {
            return this.__attrs__[attrName].getter(view, attrName, getter);
        };
        Widget.prototype.notifyViewCreated = function (view) {
            if (typeof (this.onViewCreated) == 'function') {
                this.onViewCreated(view);
            }
        };
        Widget.prototype.notifyAfterInflation = function (view) {
            if (typeof (this.onFinishInflation) == 'function') {
                this.onFinishInflation(view);
            }
        }
        return Widget;
    })();

    function ImageCache(context, imageLoader) {
        this.imageLoader = imageLoader;
        this.context = context;
    }

    ImageCache.prototype.clearMemory = function () {
        this.imageLoader.clearMemory(this.context);
    }

    ImageCache.prototype.clearDiskCache = function () {
        this.imageLoader.clearDiskCache(this.context);
    }
    ui.imageCache = new ImageCache(runtime.context, runtime.ui.drawables.imageLoader);

    var proxy = runtime.ui;
    proxy.__proxy__ = {
        set: function (name, value) {
            ui[name] = value;
        },
        get: function (name) {
            if (!ui[name] && ui.view) {
                let v = ui.findById(name);
                if (v) {
                    return v;
                }
            }
            return ui[name];
        }
    };


    return proxy;
}