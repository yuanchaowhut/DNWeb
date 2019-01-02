(function (root) {
    var push = Array.prototype.push;
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
                Array.prototype.push.apply(args,arguments);  //合并数组
                return func.apply( this, args );  //参数1：目标源，参数2：回调函数
            }
        });
    };

    //调用mixin给_的实例扩展_的静态方法.
    _.mixin(_);

    return _;
})(this);