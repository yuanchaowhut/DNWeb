(function (root) {
    var push = Array.prototype.push;
    //浏览器支持 ES5的方法就优先使用
    var nativeKeys = Object.keys;

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
        var keys = !_.isArray(obj) && keys(obj);   //即如果obj是数组，则keys=false， 如果是obj是对象，则keys为其属性名组成的数组。
        var length = (keys || obj).length;      //即如果obj是数组，那么计算的是 obj.length， 如果obj不是数组，那么计算的是keys.length.
        //创建一个等长的数组并通过循环的方式给每个元素赋值
        var result = new Array(length);
        for (var i = 0; i < length; i++) {
            var currentKey = keys ? keys[i] : i;
            result[i] = iteratee(obj[currentKey], i, obj);
        }
        return result;
    };

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
            case 3:
                return function (value, index, obj) {
                    return func.call(context, value, index, obj); //修改迭代器内部上下文的指向context,原先的是windwo.
                }
        }
    };


    //客户端没有传递迭代器参数时指向这里
    _.identity = function (value) {
        return value;
    };

    //遍历_的所有属性和方法，并返回一个数组
    _.functions = function (obj) {
        var result = [];
        for (var key in obj) {
            result.push(key);
        }
        return result;
    };


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