(function(name, context, definition) {
    if(typeof module != 'undefined' && module.exports) module.exports = definition()
    else if(typeof define == 'function' && define.amd) define(definition)
    else context[name] = definition()
})('jHelper', this, function() {

    var objProto = Object.prototype,
            toString = objProto.toString,
            identity = 0,
            hasDontEnumBug = !({toString: ''}).propertyIsEnumerable('toString'),
            DontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

    var jHelper = {

        /**
         * 文件更新时间
         * @getter
         */
        updatetime: 1364353909046,

        /**
         * 低版本IE浏览器对象变历的问题处理所需的数据
         * @getter
         */
        _enumBug: {
            state: hasDontEnumBug,
            values: DontEnums,
            length: DontEnums.length
        },

        /**
         *
         */
        debug: false,

        /**
         * 表示一个空函数。这个函数总是返回 undefined 。
         * @property
         * @type Function
         * @remark
         * 一个快捷定义，在定义一个类的抽象函数时，可以将此赋与其成员 。
         */
        emptyFn: function() {
        },

        /**
         * 生成一个全局唯一的id。如果存在prefix参数，会与id相组合
         * @param {String} prefix 前缀
         * @return {String} 返回生成后的字符串
         * @example <pre>
         * var id = jHelper.uniqueId("test");
         * trace(id) // => "test0"
         * id = jHelper.uniqueId("test");
         * trace(id) // => "test1"
         * </pre>
         */
        uniqueId: function(prefix) {
            return prefix ? prefix + identity++ : 'jHelper' + identity++;
        },

        /**
         * 返回输入的变量的类型名称（字符串），如下：
         *
         * - `undefined`: 如果输入的值为 `undefined`
         * - `null`: 如果输入的值为 `null`
         * - `string`: 如果输入的值是字符串
         * - `number`: 如果输入的值是数值
         * - `boolean`: 如果输入的值是布尔值
         * - `date`: 如果输入的值是时间对象（Date）
         * - `function`: 如果输入的值是函数对象（Function）
         * - `object`: 如果输入的值是object对象（Object）
         * - `array`: 如果输入的值是数组对象(Array)
         * - `regexp`: 如果输入的值是正则表达式对象（RegExp）
         * - `element`: 如果输入的值是DOM对象
         * - `textnode`: 如果输入的值是DOM文本对象或含有其它空白
         * - `whitespace`: 如果输入的值是只包含空格的DOM对象
         *
         * @param {Object} value
         * @return {String}
         */
        typeOf: function(value) {
            if(value === null) {
                return 'null';
            }

            var type = typeof value;

            if(type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean') {
                return type;
            }

            var typeToString = toString.call(value);

            switch(typeToString) {
                case '[object Array]':
                    return 'array';
                case '[object Date]':
                    return 'date';
                case '[object Boolean]':
                    return 'boolean';
                case '[object Number]':
                    return 'number';
                case '[object RegExp]':
                    return 'regexp';
            }

            if(type === 'function') {
                return 'function';
            }

            if(type === 'object') {
                if(value.nodeType !== undefined) {
                    if(value.nodeType === 3) {
                        return (/\S/).test(value.nodeValue) ? 'textnode' : 'whitespace';
                    }
                    else {
                        return 'element';
                    }
                }

                return 'object';
            }
        },

        /**
         * 遍历一个或多个对象复制所有成员到当前上下文对象中。
         * @param {Object} dest 复制的目标对象。
         * @return {Object} 返回 *dest*。
         * @example <pre>
         * var a = {v: 3}, b = {g: 2};
         * jHelper.extend(a, b);
         * trace(jHelper); // => {v: 3, g: 2}
         *
         * var d = {};
         * jHelper.extend.call(d,a,b);
         * trace(d); // => {v: 3, g: 2}
         * </pre>
         */
        extend: (function() {
            if(hasDontEnumBug) {
                return function() {

                    var key, Self = this,
                            args = arguments,
                            len = arguments.length,
                            override = false,
                            i = 0;
                    if(typeof args[0] == "boolean") {
                        i = 1;
                        override = args[0];
                    }

                    for(; i < len; ++i) {
                        var source = args[i];
                        for(key in source) {
                            if(typeof (Self[key]) != "undefined" && !override) {
                                continue;
                            }
                            Self[key] = source[key];
                        }
                        if(override) {
                            var protoprops = jHelper._enumBug.values;
                            for(var j = 0; j < jHelper._enumBug.length; ++j) {
                                prop = protoprops[j];
                                if(source.hasOwnProperty(prop)) Self[prop] = source[prop];
                            }
                        }
                    }
                };
            }
            return function() {

                var key, Self = this,
                        args = arguments,
                        len = arguments.length,
                        override = false,
                        i = 0;
                if(typeof args[0] == "boolean") {
                    i = 1;
                    override = args[0];
                }

                for(; i < len; ++i) {
                    var source = args[i];
                    for(key in source) {
                        if(typeof (Self[key]) != "undefined" && !override) {
                            continue;
                        }
                        Self[key] = source[key];
                    }
                }
            };
        })(),

        /**
         * 将源对象的成员复制到目标对象，默认不覆盖已存在成员
         * @param {Object} dest 目标对象
         * @param {Object} src 源对像
         * @param {boolean} override (Optional) 是否覆盖已有成员。如果是function则为混合器，为src的每一个key执行 dest[key] = override(dest[key], src[key], key);
         * @return {Object} dest
         * @example <pre>
         * var a = {v: 3}, b = {g: 2};
         * jHelper.mixin(a,b);
         * trace(a); // => {v: 3, g: 2}
         * </pre>
         */
        mixin: function(dest, src, override) {
            for(var key in src) {
                if(typeof override == "function") {
                    dest[key] = override(dest[key], src[key], key);
                } else {
                    if(src.hasOwnProperty(key)) {
                        jHelper.extend.call(dest, !!override, src);
                    }
                }
            }
            return dest;
        },

        /**
         * 声明一个命名空间并返回，如果已存在则获取。
         * @param {String} ns
         * @param value
         * @return {root}
         */
        namespace: function(ns, value) {
            ns = typeof ns === "string" ? ns.split('.') : [];
            if(!ns[0]) ns.splice(0, 1, "jHelper");
            var x, val = Object(value);
            var root = function() {
                return this
            }();
            while(ns.length > 0) {
                x = ns.shift();
                if(ns.length === 0) {
                    //if(!!root[x])console.log('key:"' + x + '" 已存在!');
                    root[x] = root[x] || val;
                } else {
                    root[x] = root[x] || {};
                }
                root = root[x];
            }

            return root;
        },

        /**
         * 创建一个具有指定原型和指定属性的对象。
         * @param {String} ns
         * @param {Object} prototype 要用作原型的对象。 不可为 null。
         * @param {Object} properties  包含一个或多个属性的 JavaScript 对象。
         * @return {Object} 一个具有指定的内部原型且包含指定的属性（如果有）的新对象。
         */
        createObject: function(prototype, properties) {
            var object;

            if((/\{\s*\[(?:native code|function)\]\s*\}/i).test(String(Object.create))) {
                object = Object.create(prototype, jHelper.mixin({}, properties, function(d, s) {
                    return (typeof s["value"] === 'undefined') ? { "value": s } : s;
                }));
            } else {
                function F() {
                }

                F.prototype = prototype;
                object = jHelper.mixin(new F(), properties);
            }

            return object;
        },

        /**
         * 创建一个类
         * @param {Object} definition
         * - {Function} constructor (Optional) 构造函数，默认为一个空函数。
         * - {Function} Extends (Optional)父类构造函数。
         * - {Function|[Function,...]} Implements 需要混入的其它类，可以是一个或多个类构造函数，多于一个需放在数组中。
         * - {Object} Statics 静态方法集合。
         * - {Function} 方法
         * @return {Function} 构造函数
         */
        createClass: function(definition) {

            var C = definition.constructor, // 构造函数
                    E = definition["Extends"], // 父类构造函数,
                    I = definition["Implements"], // 其它借用类,
                    S = definition['Statics']; // 静态方法,

            // 处理构造函数，如果未配置则为空函数
            if(C === Object) {
                C = E ? function() {
                    E.apply(this, arguments);
                } : new Function;
            } else {
                delete definition.constructor;
            }

            // 处理继承
            if(E) {
                delete definition["Extends"];
                //拷贝静态方法
                jHelper.mixin(C, E);
                //将一个拥有父类原型方法的对象赋与构造函数的原型对象
                C.prototype = jHelper.createObject(E.prototype);
                //修正原型的构造引用
                C.prototype.constructor = C;
                //暴露父类原型
                C.__super__ = C["Super"] = E.prototype;
            }

            // 混合其它类原型中的方法
            if(I) {
                delete definition["Implements"];
                if(jHelper.typeOf(I) == 'array' || (I = [I])) {
                    I.forEach(function(item) {
                        jHelper.mixin(C.prototype, item.prototype);
                    });
                }
            }

            // 处理静态方法
            if(S) {
                delete definition['Statics'];
                //挂到构造函数上
                jHelper.mixin(C, S);
            }

            // 拷贝方法
            jHelper.mixin(C.prototype, definition, true);

            for(var key in definition) delete definition[key];

            return C;

        }

    };

    return jHelper;
});


//------------------------------------------------------------------------------------------
(function(root) {
    var Self = function() {
                return this
            }(),
            identity = 0,
            hasDontEnumBug = !{toString: ''}.propertyIsEnumerable('toString'),
            DontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            DontEnumsLength = DontEnums.length;

    Self.jHelper = {

        version: "beta1",

        updatetime: 1358584874024,

        _enumBug: {
            state: hasDontEnumBug,
            values: DontEnums,
            length: DontEnumsLength
        },

        emptyFn: function() {
        },

        uniqueId: function(prefix) {
            return prefix ? prefix + identity++ : 'jHelper' + identity++;
        },

        /**
         * 复制对象的所有属性到其它对象。
         * @param {Object} dest 复制的目标对象。
         * @param {Object} src 复制的源对象。
         * @return {Object} 返回 *dest*。
         * @see Object.extendIf
         * @example <pre>
         * var a = {v: 3}, b = {g: 2};
         * Object.extend(a, b);
         * trace(a); // {v: 3, g: 2}
         * </pre>
         */
        extend: function() {
            var key, Self = this,
                    args = arguments,
                    len = arguments.length,
                    override = false,
                    i = 0;
            if(typeof args[0] == "boolean") {
                i = 1;
                override = args[0];
            }
            if(!jHelper._enumBug.state) {
                return function() {
                    for(; i < len; ++i) {
                        var source = args[i];
                        for(key in source) {
                            if(typeof (Self[key]) != "undefined" && !override) {
                                continue;
                            }
                            Self[key] = source[key];
                        }
                        if(override) {
                            var protoprops = jHelper._enumBug.values;
                            for(var j = 0; j < jHelper._enumBug.length; ++j) {
                                prop = protoprops[j];
                                if(source.hasOwnProperty(prop)) Self[prop] = source[prop];
                            }
                        }
                    }
                }();
            }
            return function() {
                for(; i < len; ++i) {
                    var source = args[i];
                    for(key in source) {
                        if(typeof (Self[key]) != "undefined" && !override) {
                            continue;
                        }
                        Self[key] = source[key];
                    }
                }
            }();
        },

        mixin: function(dest, src, override) {
            for(var key in src) {
                if(typeof override == "function") {
                    dest[key] = override(dest[key], src[key], key);
                } else {
                    if(src.hasOwnProperty(key)) {
                        jHelper.extend.call(dest, !!override, src);
                    }
                }
            }
            return dest;
        }
    };
}());

(function() {
    var
            objProto = Object.prototype,
            toString = objProto.toString,
            dataType = {
                /**
                 * 返回输入的变量的类型名称（字符串），如下：
                 *
                 * - `undefined`: 如果输入的值为 `undefined`
                 * - `null`: 如果输入的值为 `null`
                 * - `string`: 如果输入的值是字符串
                 * - `number`: 如果输入的值是数值
                 * - `boolean`: 如果输入的值是布尔值
                 * - `date`: 如果输入的值是时间对象（Date）
                 * - `function`: 如果输入的值是函数对象（Function）
                 * - `object`: 如果输入的值是object对象（Object）
                 * - `array`: 如果输入的值是数组对象(Array)
                 * - `regexp`: 如果输入的值是正则表达式对象（RegExp）
                 * - `element`: 如果输入的值是DOM对象
                 * - `textnode`: 如果输入的值是DOM文本对象或含有其它空白
                 * - `whitespace`: 如果输入的值是只包含空格的DOM对象
                 *
                 * @param {Object} value
                 * @return {String}
                 */
                typeOf: function(value) {
                    if(value === null) {
                        return 'null';
                    }

                    var type = typeof value;

                    if(type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean') {
                        return type;
                    }

                    var typeToString = toString.call(value);

                    switch(typeToString) {
                        case '[object Array]':
                            return 'array';
                        case '[object Date]':
                            return 'date';
                        case '[object Boolean]':
                            return 'boolean';
                        case '[object Number]':
                            return 'number';
                        case '[object RegExp]':
                            return 'regexp';
                    }

                    if(type === 'function') {
                        return 'function';
                    }

                    if(type === 'object') {
                        if(value.nodeType !== undefined) {
                            if(value.nodeType === 3) {
                                return (/\S/).test(value.nodeValue) ? 'textnode' : 'whitespace';
                            }
                            else {
                                return 'element';
                            }
                        }

                        return 'object';
                    }
                },
                isNull: function(value) {
                    return value === null;
                },
                isEmpty: function(value, allowEmptyString) {
                    return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (this.isArray(value) && value.length === 0);
                },
                isArray: ('isArray' in Array) ? Array.isArray : function(value) {
                    return toString.call(value) === '[object Array]';
                },
                isDate: function(value) {
                    return toString.call(value) === '[object Date]';
                },
                isObject: (toString.call(null) === '[object Object]') ?
                        function(value) {
                            // check ownerDocument here as well to exclude DOM nodes
                            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
                        } :
                        function(value) {
                            return toString.call(value) === '[object Object]';
                        },
                isSimpleObject: function(value) {
                    return value instanceof Object && value.constructor === Object;
                },
                isPrimitive: function(value) {
                    var type = typeof value;

                    return type === 'string' || type === 'number' || type === 'boolean';
                },
                isFunction: // Safari 3.x and 4.x returns 'function' for typeof <NodeList>, hence we need to fall back to using
                // Object.prototype.toString (slower)
                        (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function(value) {
                            return toString.call(value) === '[object Function]';
                        } : function(value) {
                            return typeof value === 'function';
                        },
                isNumber: function(value) {
                    return typeof value === 'number' && isFinite(value);
                },
                isNumeric: function(value) {
                    return !isNaN(parseFloat(value)) && isFinite(value);
                },
                isString: function(value) {
                    return typeof value === 'string';
                },
                isBoolean: function(value) {
                    return typeof value === 'boolean';
                },
                isElement: function(value) {
                    return value ? value.nodeType === 1 : false;
                },
                isTextNode: function(value) {
                    return value ? value.nodeName === "#text" : false;
                },
                isUndefined: function(value) {
                    return value == void 0;
                },
                isNative: function(value) {
                    return value && this.isFunction(value) && (/\{\s*\[(?:native code|function)\]\s*\}/i).test(String(value)); // Boolean
                },

                isIterable: function(value) {
                    var type = typeof value,
                            checkLength = false;
                    if(value && type != 'string') {
                        // Functions have a length property, so we need to filter them out
                        if(type == 'function') {
                            // In Safari, NodeList/HTMLCollection both return "function" when using typeof, so we need
                            // to explicitly check them here.
                            if(jHelper.isSafari()) {
                                checkLength = value instanceof NodeList || value instanceof HTMLCollection;
                            }
                        } else {
                            checkLength = true;
                        }
                    }
                    return checkLength ? value.length !== undefined : false;
                }
            };

    jHelper.extend(dataType);

}());

(function() {
    var
            na = window.navigator || "",
            ua = (na && na.userAgent) || "",
            av = (na && na.appVersion) || "",
            ex = window.external || "",

            browserType = {

                isIE: function() {
                    return (/msie/i).test(ua);
                },
                isIE6: function() {
                    return (/msie 6/i).test(ua);
                },
                isIE7: function() {
                    return (/msie 7/i).test(ua);
                },
                isIE8: function() {
                    return (/msie 8/i).test(ua);
                },
                isIE9: function() {
                    return (/msie 9/i).test(ua);
                },
                isIE10: function() {
                    return (/msie 10/i).test(ua);
                },
                isIEtouch: function() {
                    return na && na.msMaxTouchPoints && na.msMaxTouchPoints > 0;
                },
                isFirefox: function() {
                    return (/firefox/i).test(ua);
                },
                isGecko: function() {
                    return (/gecko/i).test(ua);
                },
                isOpera: function() {
                    return (/opera/i).test(ua);
                },
                isSafari: function() {
                    return (/webkit\W(?!.*chrome).*safari\W/i).test(ua);
                },
                isChrome: function() {
                    return (/webkit\W.*(chrome|chromium)\W/i).test(ua);
                },
                iswebkit: function() {
                    return (/webkit\W/i).test(ua);
                },
                isMobile: function() {
                    return (/iphone|ipod|itouch|(android.*?mobile)|blackberry|nokia/i).test(ua);
                },
                isTablet: function() {
                    return (/ipad|android(?!.*mobile)/i).test(ua);
                },
                isDesktop: function() {
                    return !this.mobile() && !this.tablet();
                },
                isKindle: function() {
                    return (/kindle|silk/i).test(ua);
                },
                isTV: function() {
                    return (/googletv|sonydtv/i).test(ua);
                },
                isExtra: function() {
                    var name;
                    (/world/i).test(ua) ? name = "world"
                            : (/360se/i).test(ua) ? name = "360"
                            : (/maxthon/i).test(ua) || typeof ex.max_version == "number" ? name = "maxthon"
                            : (/tencenttraveler\s([\d.]*)/i).test(ua) ? name = "tt"
                            : (/se\s([\d.]*)/i).test(ua) && (name = "sogou");
                    return name;
                },
                isOnline: function() {
                    return (navigator.onLine);
                },
                isOffline: function() {
                    return !this.online();
                },
                isWindows: function() {
                    return (/win/i).test(av);
                },
                isMac: function() {
                    return (/mac/i).test(av);
                },
                isUnix: function() {
                    return (/x11/i).test(av);
                },
                isLinux: function() {
                    return (/linux/i).test(av);
                }
            };

    jHelper.extend(browserType);
}());

(function() {

    jHelper.mixin(Array.prototype, {
        isArray: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        /**
         * 遍历数组里的每一项进行指定操作 *
         * @param elements
         * @param callback
         */
        forEach: function(func /*,contex*/) {
            var len = this.length;
            var context = arguments[1];
            for(var i = 0; i < len; i++) {
                if(i in this)
                    func.call(context, this[i], i, this);
            }
        },
        map: function(fn, context) {
            var len = this.length >>> 0;
            var result = new Array(len);

            for(var i = 0; i < len; i++) {
                if(i in this) {
                    result[i] = fn.call(context, this[i], i, this);
                }
            }

            return result;
        },
        filter: function(fn, context) {
            var result = [], val;

            for(var i = 0, len = this.length >>> 0; i < len; i++) {
                if(i in this) {
                    val = this[i];
                    if(fn.call(context, val, i, this)) {
                        result.push(val);
                    }
                }
            }

            return result;
        },
        every: function(fn, context) {
            for(var i = 0, len = this.length >>> 0; i < len; i++) {
                if(i in this && !fn.call(context, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        },
        some: function(fn, context) {
            for(var i = 0, len = this.length >>> 0; i < len; i++) {
                if(i in this && fn.call(context, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        },
        reduce: function(fn /*, initial*/) {
            if(typeof fn !== 'function') {
                throw new TypeError(fn + ' is not an function');
            }

            var len = this.length >>> 0, i = 0, result;

            if(arguments.length > 1) {
                result = arguments[1];
            }
            else {
                do {
                    if(i in this) {
                        result = this[i++];
                        break;
                    }
                    // if array contains no values, no initial value to return
                    if(++i >= len) {
                        throw new TypeError('reduce of empty array with on initial value');
                    }
                }
                while(true);
            }

            for(; i < len; i++) {
                if(i in this) {
                    result = fn.call(null, result, this[i], i, this);
                }
            }

            return result;
        },
        reduceRight: function(fn /*, initial*/) {
            if(typeof fn !== 'function') {
                throw new TypeError(fn + ' is not an function');
            }

            var len = this.length >>> 0, i = len - 1, result;

            if(arguments.length > 1) {
                result = arguments[1];
            }
            else {
                do {
                    if(i in this) {
                        result = this[i--];
                        break;
                    }
                    // if array contains no values, no initial value to return
                    if(--i < 0)
                        throw new TypeError('reduce of empty array with on initial value');
                }
                while(true);
            }

            for(; i >= 0; i--) {
                if(i in this) {
                    result = fn.call(null, result, this[i], i, this);
                }
            }

            return result;
        },
        /**
         * 查询数组中指定元素的索引位置 *
         * @param match
         * @param fromIndex
         * @return {*}
         */
        indexOf: function(match, fromIndex) {
            var len = this.length;
            // 小于 0
            (fromIndex = fromIndex | 0) < 0 && (fromIndex = Math.max(0, len + fromIndex));

            for(; fromIndex < len; fromIndex++) {
                if(fromIndex in this && this[fromIndex] === match) {
                    return fromIndex;
                }
            }

            return -1;
        },
        lastIndexOf: function(match, fromIndex) {
            var len = this.length;

            (!(fromIndex = fromIndex | 0) || fromIndex >= len) && (fromIndex = len - 1);
            fromIndex < 0 && (fromIndex += len);

            for(; fromIndex >= 0; fromIndex--) {
                if(fromIndex in this && this[fromIndex] === match) {
                    return fromIndex;
                }
            }

            return -1;
        },
        /**
         * 数组包含某项 *
         * @param item
         * @return {Boolean}
         */
        contains: function(item) {
            return !!~this.indexOf(item);
        },
        /**
         *  删除数组项 *
         * @param match
         * @return {*}
         */
        remove: function(match) {
            var n = this.length;
            while(n--) {
                if(this[n] === match) {
                    this.splice(n, 1);
                }
            }
            return this;
        }
    });
}());

(function() {
    jHelper.mixin(String.prototype, {
        trim: function() {
            var trimer = new RegExp('(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)', 'g');
            return function() {
                return this.replace(trimer, '');
            }
        }()
    });
    jHelper.mixin(String, {
        format: function(formatString, args) {

            //assert(!formatString || formatString.replace, 'String.format(formatString, args): {formatString} 必须是字符串。', formatString);

            // 支持参数2为数组或对象的直接格式化。
            var toString = this;

            args = arguments.length === 2 && args && typeof args === 'object' ? args : [].slice.call(arguments, 1);

            // 通过格式化返回
            return formatString ? formatString.replace(/\{+?(\S*?)\}+/g, function(match, name) {
                var start = match.charAt(1) === '{', end = match.charAt(match.length - 2) === '}';
                if(start || end)
                    return match.slice(start, match.length - end);
                return name in args ? toString(args[name]) : "";
            }) : "";
        },
        camelize: function(input) {
            return input.replace(/\W+(.)/g, function(match, letter) {
                return letter.toUpperCase();
            });
        },
        insert: function(input, string, index) {
            return input.slice(0, index) + string + input.slice(index);
        },
        contains: function(input, string) {
            return input.indexOf(string) > -1;
        },
        startsWith: function(input, string) {
            return input.indexOf(string) === 0;
        },
        endsWith: function(input, string) {
            var index = input.length - string.length;
            return index >= 0 && input.indexOf(string, index) > -1;
        },
        guid: function(length) {
            var buf = [],
                    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                    charlen = chars.length,
                    length = length || 32;

            for(var i = 0; i < length; i++) {
                buf[i] = chars.charAt(Math.floor(Math.random() * charlen));
            }

            return buf.join('');
        },
        encodeHTML: function(input) {
            var el = document.createElement('pre');
            var text = document.createTextNode(input);
            el.appendChild(text);
            return el.innerHTML;
        },
        decodeHtml: function(input) {
            var div = document.createElement('div');
            div.innerHTML = StringH.stripTags(input);
            return div.childNodes[0] ? div.childNodes[0].nodeValue || '' : '';
        },
        stripTags: function(input) {
            return input.replace(/<[^>]*>/gi, '');
        }
    });
}());

(function() {

    jHelper.mixin(Object, {
        keys: function(object) {
            if(o !== Object(object)) {
                throw new TypeError(o + ' is not an object');
            }

            var result = [],
                    hasOwnProperty = Object.prototype.hasOwnProperty;

            for(var name in object) {
                if(hasOwnProperty.call(object, name)) {
                    result.push(name);
                }
            }

            if(jHelper._enumBug.state) {
                for(var i = 0; i < jHelper._enumBug.length; i++) {
                    if(hasOwnProperty.call(object, DontEnums[i])) {
                        result.push(jHelper._enumBug.values[i]);
                    }
                }
            }

            return result;
        },

        merge: function() {
            var i = 0,
                    len = arguments.length,
                    result = arguments[0] || {},
                    override = false,
                    key,
                    obj;
            if(typeof result === "boolean") {
                override = result;
                result = arguments[1] || {};
                i = 1;
            }

            for(; i < len; ++i) {
                obj = arguments[i];
                jHelper.mixin(result, obj, override);
            }

            return result;
        }
    });
}());

(function() {

    jHelper.extend({
        /**
         * Clone almost any type of variable including array, object, DOM nodes and Date without keeping the old reference
         * @param {Object} source The variable to clone
         * @return {Object} clone
         */
        cloneObject: function(source) {
            var type = jHelper.typeOf(source);
            if(type == 'object' || type == 'array') {
                if(source.clone) {
                    return source.clone.call(source);
                }
                var clone = type == 'array' ? [] : {};
                for(var key in source) {
                    clone[key] = jHelper.cloneObject(source[key]);
                }
                return clone;
            }
            return source;
        },
        /**
         * @param elements
         * @param callback
         * @return {*}
         */
        each: function(elements, callback) {
            var key, i = 0, r, len, item, o = Object,
                    isDic = jHelper.isObject(elements),
                    isNum = jHelper.isNumber(elements),
                    isStr = jHelper.isString(elements),
                    isColl = jHelper.isIterable(elements),
                    args = Array.prototype.slice.call(arguments, 2);

            function result(i) {
                if(isColl || isDic) {
                    item = elements[i];
                } else if(isStr) {
                    item = elements.charAt(i);
                } else if(isNum) {
                    item = i;
                } else {
                    return false;
                }

                if(args.length <= 1) {
                    return callback.call(args[0] || item, item, i, elements);
                } else {
                    return callback.apply(args[0] || item, [item, i].concat(args));
                }
            }

            if(isDic) {
                for(key in elements) {
                    if(elements.hasOwnProperty(key)) {
                        r = result(key);
                        if(r == "continue") continue;
                        if(r === false || r == "break") break;
                    }
                }
            } else {
                len = isNum ? elements : (elements.length || elements.byteLength);
                for(; i < len; i++) {
                    r = result(i);
                    if(r == "continue") continue;
                    if(r === false || r == "break") break;
                }
            }

            return elements;
        },

        toArray: function(enumerable) {
            var array = [], i = enumerable.length;
            while(i--) array[i] = enumerable[i];
            return array;
        }
    });
}());

//(function() {
jHelper.extend({

    namespace: function(ns, value) {
        ns = typeof ns === "string" ? ns.split('.') : [];
        if(!ns[0]) ns.splice(0, 1, "jHelper");
        var x, val = Object(value);
        var root = function() {
            return this
        }();
        while (ns.length > 0) {
            x = ns.shift();
            if (ns.length === 0) {
                root[x] = val || {};
            } else {
                root[x] = root[x] || {};
            }
            root = root[x];
        }
        return root;
    },

    createObject: function(ns, prototype, properties) {
        var object, extist = jHelper.isObject(ns);
        if(extist) {
            properties = prototype;
            prototype = ns;
        }
        if(jHelper.isNative(Object.create)) {
            object = Object.create(prototype, jHelper.mixin({}, properties, function(d, s) {
                return (typeof s["value"] === 'undefined') ? { "value": s } : s;
            }));
        } else {
            function F() {
            }

            F.prototype = prototype;
            object = jHelper.mixin(new F(), properties);
        }
        if(extist) {
            return object;
        }
        this.namespace(ns, object);
    },

    createClass: function(ns, definition) {

        var state = jHelper.isObject(ns);

        if(state) {
            definition = ns;
        }

        var C = definition.constructor, // 构造函数
                E = definition["Extends"], // 父类构造函数,
                I = definition["Implements"], // 其它借用类,
                S = definition['Statics'], // 静态方法,
                M;// 方法,

        // 处理构造函数，如果未配置则为空函数
        if(C) {
            delete definition.constructor;
        } else {
            C = E ? function() {
                E.apply(this, arguments);
            } : jHelper.emptyFn;
        }

        // 处理静态方法
        if(S) {
            delete definition['Statics'];
            //挂到构造函数上
            jHelper.mixin(C, S);
        }

        // 处理继承
        if(E) {
            delete definition["Extends"];
            //拷贝静态方法
            jHelper.mixin(C, E);
            //将一个拥有父类原型方法的对象赋与构造函数的原型对象
            C.prototype = jHelper.createObject(E.prototype);
            //修正原型的构造引用
            C.prototype.constructor = C;
            //暴露父类原型
            C.__super__ = C["Super"] = E.prototype;
        }

        // 混合其它类原型中的方法
        if(I) {
            delete definition["Implements"];
            if(jHelper.isArray(I) || (I = [I])) {
                I.forEach(function(item) {
                    jHelper.mixin(C.prototype, item.prototype);
                });
            }
        }

        // 拷贝方法
        jHelper.mixin(C.prototype, definition, true);

        for(var key in definition) delete definition[key];

        if(state) {
            return C;
        } else {
            jHelper.namespace(ns, C);
        }

    },

    addSingletonGetter: function(Class) {
        Class.getInstance = function() {
            return Class.instance_ || (Class.instance_ = new Class());
        };
    },

    extendClass: function(target, definition, override) {
        if(!jHelper.isFunction(target)) {
            throw new TypeError("arguments[0] not a function!")
        }
        if(definition["Statics"]) {
            jHelper.mixin(target, definition["Statics"], override);
            delete definition["Statics"];
        }
        jHelper.extend.call(target.prototype, override, definition);
        for(var key in definition) delete definition[key];
    },

    aopBefore: function(target, fnName, func) {
        var fn = target[fnName];
        target[fnName] = function() {
            func.apply(this, arguments);
            return fn.apply(this, arguments);
        }
    },
    aopAfter: function(target, fnName, func) {
        var fn = target[fnName];
        target[fnName] = function() {
            fn.apply(this, arguments);
            return func.apply(this, arguments);
        };
    },
    bind: function(method, context) {
        var xargs = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
        return function() {
            var fn = jHelper.typeOf(method) === 'string' ? context[method] : method,
                    args = xargs ? xargs.concat(Array.prototype.slice.call(arguments, 0)) : arguments;
            return fn.apply(context || fn, args);
        }
    }

});

(function() {
    jHelper.createClass('Base', {
        before: function(method, fn) {
            var func = this[method];
            this[method] = function() {
                fn.apply(this, arguments);
                func.apply(this, arguments);
            }
        },
        after: function(method, fn) {
            var func = this[method];
            this[method] = function() {
                func.apply(this, arguments);
                fn.apply(this, arguments);
            }
        },
        Statics:{
            getInstance:function(){
                return this.instance_ || (this.instance_ = new this());
            }
        }
    });
}());

//}());

(function() {
    //loadJs
    //loadCss
    //loadImg
    jHelper.extend({

    });
}());

(function() {
    if(!!$ && !jHelper.isPrimitive($)) {
        !jHelper.mixin($, jHelper);
    } else {
        $ = jHelper;
    }
}());
