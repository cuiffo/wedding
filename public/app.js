(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.reset = function() {
    modules = {};
    cache = {};
    aliases = {};
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("animator.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Animator = function () {
  function Animator() {
    _classCallCheck(this, Animator);

    this.callbacks = {};
    this.isTicking = false;
  }

  _createClass(Animator, [{
    key: "startAnimation",
    value: function startAnimation(callback, hash) {
      this.callbacks[hash] = callback;

      if (!this.isTicking) {
        this.isTicking = true;
        window.requestAnimationFrame(this.tick.bind(this));
      }
    }
  }, {
    key: "cancelAnimation",
    value: function cancelAnimation(hash) {
      delete this.callbacks[hash];
    }
  }, {
    key: "tick",
    value: function tick() {
      var currentTime = new Date().getTime();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(this.callbacks)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var hash = _step.value;

          var callback = this.callbacks[hash];
          var isComplete = callback(currentTime);
          if (isComplete) {
            this.cancelAnimation(hash);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (Object.keys(this.callbacks).length) {
        window.requestAnimationFrame(this.tick.bind(this));
      } else {
        this.isTicking = false;
      }
    }
  }]);

  return Animator;
}();

var __instance__ = new Animator();
module.exports = {
  getInstance: function getInstance() {
    return __instance__;
  }
};
});

require.register("arraypolyfill.js", function(exports, require, module) {
'use strict';

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function (callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = function () {
    var toStr = Object.prototype.toString;
    var isCallable = function isCallable(fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function toInteger(value) {
      var number = Number(value);
      if (isNaN(number)) {
        return 0;
      }
      if (number === 0 || !isFinite(number)) {
        return number;
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function toLength(value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike /*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else     
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }();
}
});

;require.register("buttons.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dom = require('dom');

var Buttons = function () {
  function Buttons() {
    _classCallCheck(this, Buttons);

    this.buttons = [];
  }

  _createClass(Buttons, [{
    key: 'addButton',
    value: function addButton(element, callback) {
      var handleTouchStart = this.handleTouchStart.bind(this, element);
      var handleTouchMove = this.handleTouchMove.bind(this, element);
      var handleTouchEnd = this.handleTouchEnd.bind(this, element, callback);
      var handleClick = this.handleClick.bind(this, callback);
      Dom.addEventListener(element, 'touchstart', handleTouchStart, false);
      Dom.addEventListener(element, 'touchmove', handleTouchMove, false);
      Dom.addEventListener(element, 'touchend', handleTouchEnd, false);
      Dom.addEventListener(element, 'click', handleClick, false);
    }
  }, {
    key: 'handleTouchStart',
    value: function handleTouchStart(element) {
      this.touched = element;
    }
  }, {
    key: 'handleTouchMove',
    value: function handleTouchMove(element) {
      this.touched = null;
    }
  }, {
    key: 'handleTouchEnd',
    value: function handleTouchEnd(element, callback) {
      if (this.touched == element) {
        callback();
      }
    }
  }, {
    key: 'handleClick',
    value: function handleClick(callback) {
      callback();
    }
  }]);

  return Buttons;
}();

var __instance__ = new Buttons();
module.exports = {
  getInstance: function getInstance() {
    return __instance__;
  }
};
});

require.register("classlistPolyfill.js", function(exports, require, module) {
"use strict";

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */
if ("document" in self) {
  if (!("classList" in document.createElement("_"))) {
    (function (j) {
      "use strict";
      if (!("Element" in j)) {
        return;
      }var a = "classList",
          f = "prototype",
          m = j.Element[f],
          b = Object,
          k = String[f].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      },
          c = Array[f].indexOf || function (q) {
        var p = 0,
            o = this.length;for (; p < o; p++) {
          if (p in this && this[p] === q) {
            return p;
          }
        }return -1;
      },
          n = function n(o, p) {
        this.name = o;this.code = DOMException[o];this.message = p;
      },
          g = function g(p, o) {
        if (o === "") {
          throw new n("SYNTAX_ERR", "An invalid or illegal string was specified");
        }if (/\s/.test(o)) {
          throw new n("INVALID_CHARACTER_ERR", "String contains an invalid character");
        }return c.call(p, o);
      },
          d = function d(s) {
        var r = k.call(s.getAttribute("class") || ""),
            q = r ? r.split(/\s+/) : [],
            p = 0,
            o = q.length;for (; p < o; p++) {
          this.push(q[p]);
        }this._updateClassName = function () {
          s.setAttribute("class", this.toString());
        };
      },
          e = d[f] = [],
          i = function i() {
        return new d(this);
      };n[f] = Error[f];e.item = function (o) {
        return this[o] || null;
      };e.contains = function (o) {
        o += "";return g(this, o) !== -1;
      };e.add = function () {
        var s = arguments,
            r = 0,
            p = s.length,
            q,
            o = false;do {
          q = s[r] + "";if (g(this, q) === -1) {
            this.push(q);o = true;
          }
        } while (++r < p);if (o) {
          this._updateClassName();
        }
      };e.remove = function () {
        var t = arguments,
            s = 0,
            p = t.length,
            r,
            o = false,
            q;do {
          r = t[s] + "";q = g(this, r);while (q !== -1) {
            this.splice(q, 1);o = true;q = g(this, r);
          }
        } while (++s < p);if (o) {
          this._updateClassName();
        }
      };e.toggle = function (p, q) {
        p += "";var o = this.contains(p),
            r = o ? q !== true && "remove" : q !== false && "add";if (r) {
          this[r](p);
        }if (q === true || q === false) {
          return q;
        } else {
          return !o;
        }
      };e.toString = function () {
        return this.join(" ");
      };if (b.defineProperty) {
        var l = { get: i, enumerable: true, configurable: true };try {
          b.defineProperty(m, a, l);
        } catch (h) {
          if (h.number === -2146823252) {
            l.enumerable = false;b.defineProperty(m, a, l);
          }
        }
      } else {
        if (b[f].__defineGetter__) {
          m.__defineGetter__(a, i);
        }
      }
    })(self);
  } else {
    (function () {
      var b = document.createElement("_");b.classList.add("c1", "c2");if (!b.classList.contains("c2")) {
        var c = function c(e) {
          var d = DOMTokenList.prototype[e];DOMTokenList.prototype[e] = function (h) {
            var g,
                f = arguments.length;for (g = 0; g < f; g++) {
              h = arguments[g];d.call(this, h);
            }
          };
        };c("add");c("remove");
      }b.classList.toggle("c3", false);if (b.classList.contains("c3")) {
        var a = DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle = function (d, e) {
          if (1 in arguments && !this.contains(d) === !e) {
            return e;
          } else {
            return a.call(this, d);
          }
        };
      }b = null;
    })();
  }
};
});

require.register("countdown.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Countdown = function () {
  function Countdown() {
    _classCallCheck(this, Countdown);
  }

  _createClass(Countdown, [{
    key: 'start',
    value: function start() {
      if (this.started) {
        console.log('started already');
        return;
      }
      this.started = true;
      var endDate = new Date(2016, 9, 16, 17);

      var secondsEl = document.getElementsByClassName('seconds-count')[0];
      var minutesEl = document.getElementsByClassName('minutes-count')[0];
      var hoursEl = document.getElementsByClassName('hours-count')[0];
      var daysEl = document.getElementsByClassName('days-count')[0];

      var currentSeconds = parseInt(secondsEl.innerText);
      var currentMinutes = parseInt(minutesEl.innerText);
      var currentHours = parseInt(hoursEl.innerText);
      var currentDays = parseInt(daysEl.innerText);

      var MILLISECONDS_IN_SECOND = 1000;
      var MILLISECONDS_IN_MINUTE = MILLISECONDS_IN_SECOND * 60;
      var MILLISECONDS_IN_HOUR = MILLISECONDS_IN_MINUTE * 60;
      var MILLISECONDS_IN_DAY = MILLISECONDS_IN_HOUR * 24;
      window.setInterval(function () {
        var now = new Date();
        if (endDate.getTime() > now.getTime()) {
          var difference = endDate.getTime() - now.getTime();
          var days = Math.floor(difference / MILLISECONDS_IN_DAY);
          difference -= days * MILLISECONDS_IN_DAY;
          var hours = Math.floor(difference / MILLISECONDS_IN_HOUR);
          difference -= hours * MILLISECONDS_IN_HOUR;
          var minutes = Math.floor(difference / MILLISECONDS_IN_MINUTE);
          difference -= minutes * MILLISECONDS_IN_MINUTE;
          var seconds = Math.floor(difference / MILLISECONDS_IN_SECOND);

          if (currentDays !== days) {
            currentDays = days;
            daysEl.innerText = days;
          }
          if (currentHours !== hours) {
            currentHours = hours;
            hoursEl.innerText = hours;
          }
          if (currentMinutes !== minutes) {
            currentMinutes = minutes;
            minutesEl.innerText = minutes;
          }
          if (currentSeconds !== seconds) {
            currentSeconds = seconds;
            secondsEl.innerText = seconds;
          }
        }

        // TODO: Handle case when difference is negative. set everything to 0.
      }, 250);
    }
  }]);

  return Countdown;
}();

var __instance__ = new Countdown();
module.exports = {
  getInstance: function getInstance() {
    return __instance__;
  }
};
});

require.register("dom.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dom = function () {
  function Dom() {
    _classCallCheck(this, Dom);
  }

  _createClass(Dom, null, [{
    key: 'getScrollPosition',
    value: function getScrollPosition() {
      return document.documentElement.scrollTop || document.body.scrollTop;
    }
  }, {
    key: 'getWindowHeight',
    value: function getWindowHeight() {
      return window.innerHeight;
    }
  }, {
    key: 'getWindowWidth',
    value: function getWindowWidth() {
      return window.innerWidth;
    }
  }, {
    key: 'getSize',
    value: function getSize(element) {
      return element && element.getBoundingClientRect();
    }
  }, {
    key: 'setCssTransform',
    value: function setCssTransform(element, value) {
      element.style.webkitTransform = value;
      element.style.MozTransform = value;
      element.style.msTransform = value;
      element.style.OTransform = value;
      element.style.transform = value;
    }
  }, {
    key: 'addEventListener',
    value: function addEventListener(element, type, callback, opt_isCapturing) {
      var ieType = 'on' + type;
      if (element.addEventListener) {
        element.addEventListener(type, callback, opt_isCapturing);
      } else {
        element.attachEvent(ieType, callback);
      }
    }
  }, {
    key: 'fitTextToScreen',
    value: function fitTextToScreen(text, fontName, maxWidth, padding) {
      var screenWidth = this.getWindowWidth();
      var desiredTextWidth = screenWidth > maxWidth ? maxWidth : screenWidth;
      desiredTextWidth -= padding;
      return this.getFontHeightForWidth(text, fontName, desiredTextWidth);
    }
  }, {
    key: 'getFontHeightForWidth',
    value: function getFontHeightForWidth(text, fontName, desiredWidth) {
      var canvas = document.body.getElementsByClassName('text-fitter')[0];
      var context = canvas.getContext('2d');
      context.font = '16px ' + fontName;
      var width = context.measureText(text).width;
      var height = 16;
      var idealRatio = height / width;

      return idealRatio * desiredWidth + 'px';
    }
  }]);

  return Dom;
}();

module.exports = Dom;
});

require.register("header.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dom = require('dom');
var PageAnimation = require('pageAnimation');

var Header = function () {
  function Header() {
    _classCallCheck(this, Header);
  }

  _createClass(Header, [{
    key: 'init',
    value: function init() {
      if (this.isInit) {
        return;
      }
      this.isInit = true;
      var headerButtons = document.getElementsByClassName('header-button');
      var headerElement = document.getElementsByClassName('header')[0];

      var _loop = function _loop(i) {
        var headerButton = headerButtons[i];
        var scrollToClass = headerButton.getAttribute('scrollto');
        var scrollToElement = document.getElementsByClassName(scrollToClass)[0];
        Dom.addEventListener(headerButton, 'click', function () {
          headerElement.classList.remove('header-maximized');
          PageAnimation.getInstance().scrollToElement(scrollToElement);
        });
      };

      for (var i = 0; i < headerButtons.length; i++) {
        _loop(i);
      }

      var hamburgerButton = document.getElementsByClassName('hamburger-icon')[0];
      Dom.addEventListener(hamburgerButton, 'click', function () {
        headerElement.classList.toggle('header-maximized');
      });
    }
  }]);

  return Header;
}();

var __instance__ = new Header();
module.exports = {
  getInstance: function getInstance() {
    return __instance__;
  }
};
});

require.register("imageLoader.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ImageLoader = function () {
  function ImageLoader() {
    _classCallCheck(this, ImageLoader);
  }

  _createClass(ImageLoader, [{
    key: 'init',
    value: function init() {
      var spinner = $('.uil-ring-css');
      spinner.css('margin-left', spinner.offset().left + 'px');
      var fakeSrcs = $('img[src]');
      var numSrcs = fakeSrcs.length;
      var srcsLoaded = 0;
      fakeSrcs.each(function (i, element) {
        var fakeImage = new Image();
        fakeImage.onload = function () {
          srcsLoaded++;
          if (srcsLoaded >= numSrcs) {
            $('.loading-container').fadeOut(500);
            document.body.style.overflow = 'auto';
          }
        };
        fakeImage.src = element.src;
      });
    }
  }]);

  return ImageLoader;
}();

var __instance__ = new ImageLoader();
module.exports = {
  getInstance: function getInstance() {
    return __instance__;
  }
};
});

;require.register("infoCards.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dom = require('dom');

var InfoCards = function () {
  function InfoCards() {
    _classCallCheck(this, InfoCards);
  }

  _createClass(InfoCards, [{
    key: 'init',
    value: function init() {
      if (this.isInit) {
        return;
      }
      this.isInit = true;
      this.resize();
    }
  }, {
    key: 'resize',
    value: function resize() {
      var cards = document.getElementsByClassName('info-card-content');
      var requiredSize = 0;
      for (var i = 0; i < cards.length; i++) {
        cards[i].style.height = 'auto';
        var cardHeight = Dom.getSize(cards[i]).height;
        if (cardHeight > requiredSize) {
          requiredSize = cardHeight;
        }
      }
      for (var _i = 0; _i < cards.length; _i++) {
        cards[_i].style.height = requiredSize - 10 + 'px';
      }
    }
  }]);

  return InfoCards;
}();

var __instance__ = new InfoCards();
module.exports = {
  getInstance: function getInstance() {
    return __instance__;
  }
};
});

require.register("initialize.js", function(exports, require, module) {
'use strict';

var Countdown = require('countdown');
var Dom = require('dom');
var Header = require('header');
var InfoCards = require('infoCards');
var ImageLoader = require('imageLoader');

var positionInPage;

var handleResize = function handleResize() {
  InfoCards.getInstance().resize();

  var splashTextEl = document.getElementsByClassName('first-page-title')[0];
  // Set size of the first page text.
  splashTextEl.style.fontSize = Dom.fitTextToScreen(splashTextEl.textContent.trim(), 'Damion', 500, 20);
  splashTextEl = document.getElementsByClassName('first-page-subtitle')[0];
  // Set size of the first page text.
  splashTextEl.style.fontSize = Dom.fitTextToScreen(splashTextEl.textContent.trim(), 'Damion', 250, 100);

  var titleElements = document.getElementsByClassName('section-title-text');
  for (var i = 0; i < titleElements.length; i++) {
    var titleEl = titleElements[i];
    titleEl.style.fontSize = Dom.fitTextToScreen(titleEl.textContent.trim(), 'Damion', 550, 70);
  }
};

var handleScroll = function handleScroll(e) {
  var positionInPage = Dom.getScrollPosition();
  var headerEl = document.getElementsByClassName('header')[0];
  var hasScrolledCss = headerEl.classList.contains('header-scrolled');
  if (positionInPage > Dom.getWindowHeight() - 40 && !hasScrolledCss) {
    headerEl.classList.add('header-scrolled');
  } else if (positionInPage < Dom.getWindowHeight() - 40 && hasScrolledCss) {
    headerEl.classList.remove('header-scrolled');
  }
};

var openUrl = function openUrl(url) {
  return function () {
    var win = window.open(url, '_blank');
  };
};

var init = function init() {
  ImageLoader.getInstance().init();

  Dom.addEventListener(window, 'resize', handleResize);
  Dom.addEventListener(window, 'scroll', handleScroll);

  var frontPage = document.getElementsByClassName('first-page')[0];
  frontPage.style.height = Dom.getWindowHeight() + 'px';

  $("span[src]").each(function (i, element) {
    Dom.addEventListener(element, 'click', openUrl(element.getAttribute('src')));
  });
  $("div[src]").each(function (i, element) {
    Dom.addEventListener(element, 'click', openUrl(element.getAttribute('src')));
  });

  Countdown.getInstance().start();
  Header.getInstance().init();
  InfoCards.getInstance().init();
  handleResize();
  handleScroll();

  window.sr = ScrollReveal();
  sr.reveal('.bridal-party-member', { duration: 400 });
  sr.reveal('.info-card', { duration: 400 });
};

jQuery(document).ready(function ($) {
  init();

  // Init the scroller library.
  $.Scrollax();
  $.fn.coverImage = function (contain) {
    this.each(function () {
      var $this = $(this),
          src = $this.get(0).src,
          $wrapper = $this.parent();

      if (contain) {
        $wrapper.css({
          'background': 'url(' + src + ') 50% 50%/contain no-repeat'
        });
      } else {
        $wrapper.css({
          'background': 'url(' + src + ') 50% 50%/cover no-repeat'
        });
      }

      $this.remove();
    });

    return this;
  };
  $('.cover-image').coverImage();
});
});

require.register("maths.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Maths = function () {
  function Maths() {
    _classCallCheck(this, Maths);
  }

  _createClass(Maths, null, [{
    key: "easeOutQuad",
    value: function easeOutQuad(t, b, c, d) {
      t /= d;
      return -c * t * (t - 2) + b;
    }
  }, {
    key: "easeInOutQuad",
    value: function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }
  }, {
    key: "Rect",
    value: function Rect(height, width) {
      this.height = height;
      this.width = width;
    }
  }]);

  return Maths;
}();

module.exports = Maths;
});

require.register("objectpolyfill.js", function(exports, require, module) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = function () {
    'use strict';

    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !{ toString: null }.propertyIsEnumerable('toString'),
        dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [],
          prop,
          i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }();
}
});

;require.register("pageAnimation.js", function(exports, require, module) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Animator = require('animator');
var Dom = require('dom');
var Maths = require('maths');

var PageAnimation = function () {
  function PageAnimation() {
    _classCallCheck(this, PageAnimation);

    this.HASH = 'pageAnimationHash';
    this.SCROLL_ANIM_DURATION = 500;
    this.easeScrollEndTime = 0;
    this.easeScrollPositionStart = 0;
    this.easeScrollPositionEnd = 0;
    this.lastStartScroll = 0;
    this.isAnimating = false;
    this.animatorHash = -1;
  }

  _createClass(PageAnimation, [{
    key: 'scrollToElement',
    value: function scrollToElement(element) {
      var animator = Animator.getInstance();
      animator.cancelAnimation(this.HASH);
      var scrollTo = element.offsetTop;
      this.easeScrollPositionEnd = scrollTo;
      this.easeScrollEndTime = new Date().getTime() + this.SCROLL_ANIM_DURATION;
      var top = Dom.getScrollPosition();
      this.easeScrollPositionStart = top;
      this.lastStartScroll = top;
      var boundFn = this.pageAnimationFn.bind(this);
      animator.startAnimation(boundFn, this.HASH);
      this.isAnimating = true;
    }
  }, {
    key: 'pageAnimationFn',
    value: function pageAnimationFn(currentTime) {
      var isComplete = false;
      if (currentTime > this.easeScrollEndTime) {
        this.lastStartScroll = this.easeScrollPositionEnd;
        isComplete = true;
        this.isAnimating = false;
      } else {
        var startTime = this.easeScrollEndTime - this.SCROLL_ANIM_DURATION;
        var calc = Maths.easeInOutQuad(currentTime - startTime, this.easeScrollPositionStart, this.easeScrollPositionEnd - this.easeScrollPositionStart, this.SCROLL_ANIM_DURATION);
        this.lastStartScroll = calc;
      }
      window.scrollTo(0, this.lastStartScroll);
      return isComplete;
    }
  }]);

  return PageAnimation;
}();

var __instance__ = new PageAnimation();
module.exports = {
  getInstance: function getInstance() {
    return __instance__;
  }
};
});

require.register("readyPolyfill.js", function(exports, require, module) {
"use strict";

var ready = function () {

    var readyList,
        _DOMContentLoaded2,
        class2type = {};
    class2type["[object Boolean]"] = "boolean";
    class2type["[object Number]"] = "number";
    class2type["[object String]"] = "string";
    class2type["[object Function]"] = "function";
    class2type["[object Array]"] = "array";
    class2type["[object Date]"] = "date";
    class2type["[object RegExp]"] = "regexp";
    class2type["[object Object]"] = "object";

    var ReadyObj = {
        // Is the DOM ready to be used? Set to true once it occurs.
        isReady: false,
        // A counter to track how many items to wait for before
        // the ready event fires. See #6781
        readyWait: 1,
        // Hold (or release) the ready event
        holdReady: function holdReady(hold) {
            if (hold) {
                ReadyObj.readyWait++;
            } else {
                ReadyObj.ready(true);
            }
        },
        // Handle when the DOM is ready
        ready: function ready(wait) {
            // Either a released hold or an DOMready/load event and not yet ready
            if (wait === true && ! --ReadyObj.readyWait || wait !== true && !ReadyObj.isReady) {
                // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                if (!document.body) {
                    return setTimeout(ReadyObj.ready, 1);
                }

                // Remember that the DOM is ready
                ReadyObj.isReady = true;
                // If a normal DOM Ready event fired, decrement, and wait if need be
                if (wait !== true && --ReadyObj.readyWait > 0) {
                    return;
                }
                // If there are functions bound, to execute
                readyList.resolveWith(document, [ReadyObj]);

                // Trigger any bound ready events
                //if ( ReadyObj.fn.trigger ) {
                //  ReadyObj( document ).trigger( "ready" ).unbind( "ready" );
                //}
            }
        },
        bindReady: function bindReady() {
            if (readyList) {
                return;
            }
            readyList = ReadyObj._Deferred();

            // Catch cases where $(document).ready() is called after the
            // browser event has already occurred.
            if (document.readyState === "complete") {
                // Handle it asynchronously to allow scripts the opportunity to delay ready
                return setTimeout(ReadyObj.ready, 1);
            }

            // Mozilla, Opera and webkit nightlies currently support this event
            if (document.addEventListener) {
                // Use the handy event callback
                document.addEventListener("DOMContentLoaded", _DOMContentLoaded2, false);
                // A fallback to window.onload, that will always work
                window.addEventListener("load", ReadyObj.ready, false);

                // If IE event model is used
            } else if (document.attachEvent) {
                    // ensure firing before onload,
                    // maybe late but safe also for iframes
                    document.attachEvent("onreadystatechange", _DOMContentLoaded2);

                    // A fallback to window.onload, that will always work
                    window.attachEvent("onload", ReadyObj.ready);

                    // If IE and not a frame
                    // continually check to see if the document is ready
                    var toplevel = false;

                    try {
                        toplevel = window.frameElement == null;
                    } catch (e) {}

                    if (document.documentElement.doScroll && toplevel) {
                        doScrollCheck();
                    }
                }
        },
        _Deferred: function _Deferred() {
            var // callbacks list
            callbacks = [],

            // stored [ context , args ]
            fired,

            // to avoid firing when already doing so
            firing,

            // flag to know if the deferred has been cancelled
            cancelled,

            // the deferred itself
            deferred = {

                // done( f1, f2, ...)
                done: function done() {
                    if (!cancelled) {
                        var args = arguments,
                            i,
                            length,
                            elem,
                            type,
                            _fired;
                        if (fired) {
                            _fired = fired;
                            fired = 0;
                        }
                        for (i = 0, length = args.length; i < length; i++) {
                            elem = args[i];
                            type = ReadyObj.type(elem);
                            if (type === "array") {
                                deferred.done.apply(deferred, elem);
                            } else if (type === "function") {
                                callbacks.push(elem);
                            }
                        }
                        if (_fired) {
                            deferred.resolveWith(_fired[0], _fired[1]);
                        }
                    }
                    return this;
                },

                // resolve with given context and args
                resolveWith: function resolveWith(context, args) {
                    if (!cancelled && !fired && !firing) {
                        // make sure args are available (#8421)
                        args = args || [];
                        firing = 1;
                        try {
                            while (callbacks[0]) {
                                callbacks.shift().apply(context, args); //shifts a callback, and applies it to document
                            }
                        } finally {
                            fired = [context, args];
                            firing = 0;
                        }
                    }
                    return this;
                },

                // resolve with this as context and given arguments
                resolve: function resolve() {
                    deferred.resolveWith(this, arguments);
                    return this;
                },

                // Has this deferred been resolved?
                isResolved: function isResolved() {
                    return !!(firing || fired);
                },

                // Cancel
                cancel: function cancel() {
                    cancelled = 1;
                    callbacks = [];
                    return this;
                }
            };

            return deferred;
        },
        type: function type(obj) {
            return obj == null ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
        }
    };
    // The DOM ready check for Internet Explorer
    function doScrollCheck() {
        if (ReadyObj.isReady) {
            return;
        }

        try {
            // If IE is used, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            document.documentElement.doScroll("left");
        } catch (e) {
            setTimeout(doScrollCheck, 1);
            return;
        }

        // and execute any waiting functions
        ReadyObj.ready();
    }
    // Cleanup functions for the document ready method
    if (document.addEventListener) {
        _DOMContentLoaded2 = function DOMContentLoaded() {
            document.removeEventListener("DOMContentLoaded", _DOMContentLoaded2, false);
            ReadyObj.ready();
        };
    } else if (document.attachEvent) {
        _DOMContentLoaded2 = function _DOMContentLoaded() {
            // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
            if (document.readyState === "complete") {
                document.detachEvent("onreadystatechange", _DOMContentLoaded2);
                ReadyObj.ready();
            }
        };
    }
    function ready(fn) {
        // Attach the listeners
        ReadyObj.bindReady();

        var type = ReadyObj.type(fn);

        // Add the callback
        readyList.done(fn); //readyList is result of _Deferred()
    }
    return ready;
}();
});

require.register("requestAnimationFrame.js", function(exports, require, module) {
'use strict';

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
})();
});

require.register("textcontentpolyfill.js", function(exports, require, module) {
"use strict";

if (Object.defineProperty && Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(Element.prototype, "textContent") && !Object.getOwnPropertyDescriptor(Element.prototype, "textContent").get) {
  (function () {
    var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
    Object.defineProperty(Element.prototype, "textContent", {
      get: function get() {
        return innerText.get.call(this);
      },
      set: function set(s) {
        return innerText.set.call(this, s);
      }
    });
  })();
}
});

;require.register("trimpolyfill.js", function(exports, require, module) {
'use strict';

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}
});

;
//# sourceMappingURL=app.js.map