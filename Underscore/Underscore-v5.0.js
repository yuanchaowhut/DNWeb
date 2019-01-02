(function (root) {
    var push = Array.prototype.push,  //减少原型链的 访问次数
        ObjProto = Object.prototype,
        nativeKeys = Object.keys;    //浏览器支持 ES5的方法就优先使用

    var _ = function (obj) {
        //客户端使用 _()，第一次调用时，this指向的是window，执行结果return new _()，再次调用了_()，this指向的就是 _ 的一个实例了。
        //由于instanceof判断的存在，就不会再进if内部，从而避免了循环调用。
        if (!(this instanceof _)) {
            return new _(obj);
        }
        this.wrap = obj;
    };


    //CommonJS规范
    typeof module !== "undefined" && module.exports ? module.exports = _ : root._ = _;

    //AMD规范  reqirejs 客户端模块加载器如何实现
    if (typeof define === "function" && define.amd) {
        define("underscore", [], function () {
            return {
                _: _
            }
        });
    }


    //数组去重
    _.uniq = function (target, callback) {
        var result = [];
        if (!_.isArray(target)) {
            return "";
        }
        for (var i = 0; i < target.length; i++) {
            var computed = callback ? callback(target[i]) : target[i];
            if (result.indexOf(computed) === -1) {
                result.push(computed);
            }
        }
        return result;
    };

    //遍历_的所有属性和方法，并返回一个数组
    _.functions = function (obj) {
        var result = [];
        for (var key in obj) {
            result.push(key);
        }
        return result;
    };


    //遍历数组、对象的each方法
    _.each = function (target, callback) {
        if (_.isArray(target)) {
            for (var i = 0; i < target.length; i++) {
                callback.call(target, target[i], i);
            }
        } else {
            for (var key in target) {
                callback.call(target, key, target[key]);
            }
        }
    };

    //开启链式调用
    _.chain = function (obj) {
        var instance = _(obj);
        instance._chain = true;  //_chain 标识当前的实例对象支持链接式的调用
        return instance;
    };

    //辅助函数
    var result = function (instance, obj) {
        //！！！特别注意：这里有一个坑。
        // _.chain(obj) 表示调用_的静态方法， _(obj).chain() 表示调用_的原型对象上的chain方法，
        // 此时参数obj的传递是在apply里进行的，仔细阅读_.mixin方法。

        return instance._chain ? _(obj).chain() : obj;
    };

    //当开启链式调用后，每次调用完后的结果都会保存在this.wrap上，故可以直接返回。
    //当调用value()方法时，就表示链式调用结束。
    _.prototype.value = function () {
        return this.wrap;
    };

    //类型检测
    _.isArray = function (array) {
        return toString.call(array) === "[object Array]";
    };

    //给_扩展一系列类型判断函数
    _.each(["Function", "String", "Object", "Number"], function (name) {
        _["is" + name] = function (obj) {
            return toString.call(obj) === "[object " + name + "]";
        }
    });


    /*
    obj       目标源对象   必须
    iteratee   迭代器   ( 不仅可以是函数 对象  字符串  字面量的值 )   选择
    context    绑定的上下文对象    选择
   */
    _.map = function (obj, iteratee, context) {
        //生成不同功能的迭代器,return function(){}
        var iteratee = cb(iteratee, context);
        //如果传入是object对象   获取key 存储在一个数组中
        var keys = !_.isArray(obj) && _.keys(obj);   //即如果obj是数组，则keys=false， 如果是obj是对象，则keys为其属性名组成的数组。
        var length = (keys || obj).length;      //即如果obj是数组，那么计算的是 obj.length， 如果obj不是数组，那么计算的是keys.length.
        //创建一个等长的数组并通过循环的方式给每个元素赋值
        var result = new Array(length);
        for (var i = 0; i < length; i++) {
            var currentKey = keys ? keys[i] : i;
            result[i] = iteratee(obj[currentKey], i, obj);
        }
        return result;
    };

    var hasEnumBug = !{valueOf: null}.propertyIsEnumerable("valueOf");  //valueOf属性是否可以遍历的
    var noEnumProps = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];

    function collect(obj, keys) {
        var nElen = noEnumProps.length,
            prototype = obj.constructor.prototype || ObjProto;   //原型对象
        for (var i = 0; i < nElen; i++) {
            var key = noEnumProps[i];
            //obj上有不可遍历的属性并且它对应的value与原型对象上同属性名对应的value不一致(说明重写过)，则添加进来.
            if (key in obj && obj[key] !== prototype[key]) {
                keys.push(key);
            }
        }
    }

    _.keys = function (obj) {
        //允许错误
        if (!_.isObject(obj)) {
            return []
        }
        //浏览器是否支持Object.keys
        if (nativeKeys) {
            return nativeKeys(obj);
        }
        var keys = [];
        for (var key in obj) {
            keys.push(key);
        }

        // IE9 兼容性的问题.
        // IE9浏览器的一个特性：当重写obj的原型对象上的属性或方法时，系统还是默认它为不可枚举属性。
        // 但是如果是其他现代浏览器或者IE其他版本浏览器，当我们重写obj的原型对象上的属性或方法后，
        // 比如 valueOf,toString等后，该属性就会由原本的不可遍历变成可以遍历。所以我们使用for in
        // 遍历对象的属性时，就要考虑到用户可能会重写这些特殊的属性。
        if (hasEnumBug) {
            collect(obj, keys);
        }
        return keys;
    };


    var cb = function (iteratee, context, args) {
        if (iteratee == null) {
            return _.identity;
        }

        if (_.isFunction(iteratee)) {
            return optimizeCb(iteratee, context, args);
        }

        if (_.isObject(iteratee)) {
            return;
        }
    };

    var optimizeCb = function (func, context, args) {
        //context 是否有值  上下文对象是否设置
        //void(express) 会计算出express的值，但是会返回undefined，这样得到的undefined比较纯粹，
        // 不会因为undefined不是系统关键字，可能会被局部变量修改带来隐患。void 0 开销最小。
        if (context == void 0) {
            return func;
        }
        switch (args == null ? 3 : args) {
            case 1:
                return function (value) {
                    return func.call(context, value);
                };
            case 3:
                return function (value, index, obj) {
                    return func.call(context, value, index, obj); //修改迭代器内部上下文的指向context,原先的是window.
                };
            case 4:
                return function (memo, value, index, obj) {
                    return func.call(context, memo, value, index, obj);
                };
        }
    };


    _.times = function (n, iteratee, context) {
        var result = new Array(Math.max(0, n));
        iteratee = optimizeCb(iteratee, context, 1);
        for (var i = 0; i < result.length; i++) {
            result[i] = iteratee(i);
        }
        return result;
    };

    var createReduce = function (direction) {
        var reduce = function (obj, iteratee, memo, init) {
            var keys = !_.isArray(obj) && _.keys(obj),
                length = (keys || obj).length,
                index = direction > 0 ? 0 : length - 1;   //确定累加的方向

            if (!init) { //没传累计初始值
                memo = obj[keys ? keys[index] : index];   //obj的第一项数据成员作为memo的初始累计值
                index += direction;                         //索引变化一位
            }
            //下面这种写法支持两种方向遍历
            for (; index >= 0 && index < length; index += direction) {
                var currnteKey = keys ? keys[index] : index;
                memo = iteratee(memo, obj[currnteKey], currnteKey, obj);
            }
            return memo;
        };

        //createReduce(1)指向的就是这里return回去的函数
        //越稳定的参数位置越靠前，obj, interatee是肯定会传的，另外两个不一定会传。
        return function (obj, iteratee, memo, context) {
            //判断是否传递了累加初始值
            var init = arguments.length >= 3;
            return reduce(obj, optimizeCb(iteratee, context, 4), memo, init);  //调用内部函数
        };
    };

    _.reduce = createReduce(1);    //1-正向迭代，-1-反向迭代

    //客户端没有传递迭代器参数时指向这里
    _.identity = function (value) {
        return value;
    };


    /**
     * 包装器  包装函数fn 使它支持rest参数
     */
    _.restArgs = function (fn) {
        return function () {
            var argsLen = fn.length;        //fn函数的形参个数
            var startIndex = argsLen - 1;   //rest参数在形参中的索引位置
            var args = new Array(argsLen);  //创建一个实参数组(空)，后边进行赋值
            for (var i = 0; i < startIndex; i++) {
                args[i] = arguments[i];     //arguments是实参
            }
            args[startIndex] = Array.prototype.slice.call(arguments, startIndex);
            console.log("rest参数:" + args[startIndex]);
            return fn.apply(this, args);
        }
    }


    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };

    _.invert = function (obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    }

    var unescapeMap = _.invert(escapeMap);

    var createEscaper = function (map) {
        //match参数为正则匹配到的每一项
        var escaper = function (match) {
            return map[match];
        };

        var exp = "(?:" + _.keys(map).join("|") + ")";    //?:表示只获取不匹配
        var testExp = new RegExp(exp);           //test时只要目标源字符串中包含任意一个需逃逸的字符，则test就会返回true，故不用全局模式.
        var replaceExp = new RegExp(exp, 'g');   //替换时由于需全局替换，故要用全局模式

        return function (string) {
            string = string == null ? "" : string;
            return testExp.test(string) ? string.replace(replaceExp, escaper) : string;
        }
    };

    //字符逃逸方法
    _.escape = createEscaper(escapeMap);

    //字符反逃逸方法
    _.unescape = createEscaper(unescapeMap);

    _.extend = function () {
        var target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            option;
        if (typeof target !== "object") {
            target = {};
        }

        for (; i < length; i++) {
            if ((option = arguments[i]) != null) {
                for (var key in option) {
                    target[key] = option[key];
                }
            }
        }
        return target;
    }

    //解析规则
    _.templateSettings = {
        //执行体  js逻辑代码
        evaluate: /<%([\s\S]+?)%>/g,   //\s\S表示所有字符(空格字符与非空格字符), g表示全局匹配, ?表非贪婪匹配
        //插入变量
        interpolate: /<%=([\s\S]+?)%>/g,
        //逃逸
        escape: /<%-([\s\S]+?)%>/g
    }

    /*
     模板引擎
     text  模板字符串
     settings 自定义配置
    */
    _.template = function (text, settings) {
        settings = _.extend({}, settings, _.templateSettings);
        // console.log(settings);
        var matcher = RegExp([
            settings.escape.source,
            settings.interpolate.source,
            settings.evaluate.source
        ].join("|"), "g");

        //source为函数的执行体
        var source = "_p+='";
        var index = 0;
        //match: 正则匹配到的文本; escape, interpolate, evaluate: 正则匹配到的第一、二、三个正则子表达式文本.
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            //通过字符串切割，拼接上不用替换的内容
            source += text.slice(index, offset);
            //重置字符串切割的起始点
            index = offset + match.length;

            if (escape) {
                source += "'+\n((_t=" + escape + ")==null?'':_.escape(_t))+\n'";
            } else if (interpolate) {
                source += "'+\n((_t=" + interpolate + ")==null?'':_t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n_p+='";
            }

        });
        source += "';\n";
        //with语句限定作用域
        if (!settings.variable) {
            source = "with(obj||{}){\n" + source + "}\n";
        }
        source = "var _t,_p='';\n" + source + "return _p;\n";
        // console.log("函数执行体：\n" + source);
        //渲染函数  "obj"  == data   "_" ==undesocre   source ==  函数主体内容.
        var render = new Function(settings.variable || "obj", "_", source);

        var template = function (data) {
            return render.call(this, data, _);
        }
        return template;
    }


    //在_上扩展一个mixin方法，用于将_的静态方法扩展到_的实例上，避免大量的 _.prototype.xxx = function(){} 代码。
    _.mixin = function (obj) {
        _.each(_.functions(obj), function (name) {
            //参数name实际上就是_的方法名
            var func = obj[name];
            //在_原型上扩展一个同名方法
            _.prototype[name] = function () {
                //_([xxx,xxx]).uniq(function(){}); ===>  _.uniq([xxx,xxx],function(){});
                var args = [this.wrap];
                push.apply(args, arguments);  //合并数组
                return result(this, func.apply(this, args));  //参数1：目标源，参数2：回调函数
            }
        });
    };

    //调用mixin给_的实例扩展_的静态方法.
    _.mixin(_);

    return _;
})(this);