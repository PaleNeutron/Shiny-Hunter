'use strict';

/**
 * https://github.com/then/promise
 */

var asap = (function () {
  var domain; // The domain module is executed on demand
  var hasSetImmediate = typeof setImmediate === "function";
  
  // Use the fastest means possible to execute a task in its own turn, with
  // priority over other events including network IO events in Node.js.
  //
  // An exception thrown by a task will permanently interrupt the processing of
  // subsequent tasks. The higher level `asap` function ensures that if an
  // exception is thrown by a task, that the task queue will continue flushing as
  // soon as possible, but if you use `rawAsap` directly, you are responsible to
  // either ensure that no exceptions are thrown from your task, or to manually
  // call `rawAsap.requestFlush` if an exception is thrown.
  function rawAsap(task) {
      if (!queue.length) {
          requestFlush();
          flushing = true;
      }
      // Avoids a function call
      queue[queue.length] = task;
  }
  
  var queue = [];
  // Once a flush has been requested, no further calls to `requestFlush` are
  // necessary until the next `flush` completes.
  var flushing = false;
  // The position of the next task to execute in the task queue. This is
  // preserved between calls to `flush` so that it can be resumed if
  // a task throws an exception.
  var index = 0;
  // If a task schedules additional tasks recursively, the task queue can grow
  // unbounded. To prevent memory excaustion, the task queue will periodically
  // truncate already-completed tasks.
  var capacity = 1024;
  
  // The flush function processes all tasks that have been scheduled with
  // `rawAsap` unless and until one of those tasks throws an exception.
  // If a task throws an exception, `flush` ensures that its state will remain
  // consistent and will resume where it left off when called again.
  // However, `flush` does not make any arrangements to be called again if an
  // exception is thrown.
  function flush() {
      while (index < queue.length) {
          var currentIndex = index;
          // Advance the index before calling the task. This ensures that we will
          // begin flushing on the next task the task throws an error.
          index = index + 1;
          queue[currentIndex].call();
          // Prevent leaking memory for long chains of recursive calls to `asap`.
          // If we call `asap` within tasks scheduled by `asap`, the queue will
          // grow, but to avoid an O(n) walk for every task we execute, we don't
          // shift tasks off the queue after they have been executed.
          // Instead, we periodically shift 1024 tasks off the queue.
          if (index > capacity) {
              // Manually shift all values starting at the index back to the
              // beginning of the queue.
              for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                  queue[scan] = queue[scan + index];
              }
              queue.length -= index;
              index = 0;
          }
      }
      queue.length = 0;
      index = 0;
      flushing = false;
  }
  
  rawAsap.requestFlush = requestFlush;
  function requestFlush() {
      // Ensure flushing is not bound to any domain.
      // It is not sufficient to exit the domain, because domains exist on a stack.
      // To execute code outside of any domain, the following dance is necessary.
      var parentDomain = typeof(process) !== "undefined" && process.domain;
      if (parentDomain) {
          if (!domain) {
              // Lazy execute the domain module.
              // Only employed if the user elects to use domains.
              domain = require("domain");
          }
          domain.active = process.domain = null;
      }
  
      // `setImmediate` is slower that `process.nextTick`, but `process.nextTick`
      // cannot handle recursion.
      // `requestFlush` will only be called recursively from `asap.js`, to resume
      // flushing after an error is thrown into a domain.
      // Conveniently, `setImmediate` was introduced in the same version
      // `process.nextTick` started throwing recursion errors.
      if (flushing && hasSetImmediate) {
          setImmediate(flush);
      } else {
          // Auto.js Modified
          setImmediate(flush);
          // process.nextTick(flush);
      }
  
      if (parentDomain) {
          domain.active = process.domain = parentDomain;
      }
  }  
  return rawAsap;
})();


function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('Promise constructor\'s argument is not a function');
  }
  this._U = 0;
  this._V = 0;
  this._W = null;
  this._X = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._Y = null;
Promise._Z = null;
Promise._0 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
}
function handle(self, deferred) {
  while (self._V === 3) {
    self = self._W;
  }
  if (Promise._Y) {
    Promise._Y(self);
  }
  if (self._V === 0) {
    if (self._U === 0) {
      self._U = 1;
      self._X = deferred;
      return;
    }
    if (self._U === 1) {
      self._U = 2;
      self._X = [self._X, deferred];
      return;
    }
    self._X.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._V === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._V === 1) {
        resolve(deferred.promise, self._W);
      } else {
        reject(deferred.promise, self._W);
      }
      return;
    }
    var ret = tryCallOne(cb, self._W);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._V = 3;
      self._W = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._V = 1;
  self._W = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._V = 2;
  self._W = newValue;
  if (Promise._Z) {
    Promise._Z(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._U === 1) {
    handle(self, self._X);
    self._X = null;
  }
  if (self._U === 2) {
    for (var i = 0; i < self._X.length; i++) {
      handle(self, self._X[i]);
    }
    self._X = null;
  }
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  });
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}


/**********************  es6 extensions **********************/


/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._0);
  p._V = 1;
  p._W = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

var iterableToArray = function (iterable) {
  if (typeof Array.from === 'function') {
    // ES2015+, iterables exist
    iterableToArray = Array.from;
    return Array.from(iterable);
  }

  // ES5, only arrays and array-likes exist
  iterableToArray = function (x) { return Array.prototype.slice.call(x); };
  return Array.prototype.slice.call(iterable);
}

Promise.all = function (arr) {
  var args = iterableToArray(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._V === 3) {
            val = val._W;
          }
          if (val._V === 1) return res(i, val._W);
          if (val._V === 2) reject(val._W);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    iterableToArray(values).forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};


/**********************  node extensions **********************/


/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  if (
    typeof argumentCount === 'number' && argumentCount !== Infinity
  ) {
    return denodeifyWithCount(fn, argumentCount);
  } else {
    return denodeifyWithoutCount(fn);
  }
};

var callbackFn = (
  'function (err, res) {' +
  'if (err) { rj(err); } else { rs(res); }' +
  '}'
);
function denodeifyWithCount(fn, argumentCount) {
  var args = [];
  for (var i = 0; i < argumentCount; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'return new Promise(function (rs, rj) {',
    'var res = fn.call(',
    ['self'].concat(args).concat([callbackFn]).join(','),
    ');',
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');
  return Function(['Promise', 'fn'], body)(Promise, fn);
}
function denodeifyWithoutCount(fn) {
  var fnLength = Math.max(fn.length - 1, 3);
  var args = [];
  for (var i = 0; i < fnLength; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'var args;',
    'var argLength = arguments.length;',
    'if (arguments.length > ' + fnLength + ') {',
    'args = new Array(arguments.length + 1);',
    'for (var i = 0; i < arguments.length; i++) {',
    'args[i] = arguments[i];',
    '}',
    '}',
    'return new Promise(function (rs, rj) {',
    'var cb = ' + callbackFn + ';',
    'var res;',
    'switch (argLength) {',
    args.concat(['extra']).map(function (_, index) {
      return (
        'case ' + (index) + ':' +
        'res = fn.call(' + ['self'].concat(args.slice(0, index)).concat('cb').join(',') + ');' +
        'break;'
      );
    }).join(''),
    'default:',
    'args[argLength] = cb;',
    'res = fn.apply(self, args);',
    '}',
    
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');

  return Function(
    ['Promise', 'fn'],
    body
  )(Promise, fn);
}

Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
};

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
};


/**********************  done extensions **********************/

Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};


/**********************  finally extensions **********************/

Promise.prototype.finally = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};


/**********************  synchronous extensions **********************/

Promise.enableSynchronous = function () {
  Promise.prototype.isPending = function() {
    return this.getState() == 0;
  };

  Promise.prototype.isFulfilled = function() {
    return this.getState() == 1;
  };

  Promise.prototype.isRejected = function() {
    return this.getState() == 2;
  };

  Promise.prototype.getValue = function () {
    if (this._V === 3) {
      return this._W.getValue();
    }

    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._W;
  };

  Promise.prototype.getReason = function () {
    if (this._V === 3) {
      return this._W.getReason();
    }

    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._W;
  };

  Promise.prototype.getState = function () {
    if (this._V === 3) {
      return this._W.getState();
    }
    if (this._V === -1 || this._V === -2) {
      return 0;
    }

    return this._V;
  };
};

Promise.disableSynchronous = function() {
  Promise.prototype.isPending = undefined;
  Promise.prototype.isFulfilled = undefined;
  Promise.prototype.isRejected = undefined;
  Promise.prototype.getValue = undefined;
  Promise.prototype.getReason = undefined;
  Promise.prototype.getState = undefined;
};
