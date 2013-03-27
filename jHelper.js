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
