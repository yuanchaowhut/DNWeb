(function (window) {
    var jQuery = function (selector) {
        return new jQuery.prototype.init(selector);    //桥接模式，如果直接return new jQuery() ，则会循环调用报错。
    }


    jQuery.fn = jQuery.prototype = {
        init: function (selector) {
            //字符串
            //对象
        }
    }

    //支持扩展深层次拷贝
    jQuery.extend = jQuery.fn.extend = function () {
        var length = arguments.length;
        var target = arguments[0] || {};
        var i = 1;
        var deep = false; //默认为false,即浅拷贝.

        if (typeof target === "boolean") {
            if (length == i) {
                return;
            }
            deep = target;    //deep=true
            target = arguments[1] || {};
            i++;
        }

        if (typeof target != "object") {
            target = {};
        }
        //只传1个参数
        if (length == i) {
            target = this;    //当通过jQuery函数对象调用时，this代表函数对象，当通过jQuery实例调用时，this代表jQuery实例对象。
            i--;              //将i置位0
        }
        //当i=0时，会将第一个对象属性扩展到target对象上，此时target已经指向了this了，所以实际上就是扩展到了函数对象或者jQuery实例对象上.
        //当i=1时，会将第2个对象开始，所有对象的属性依次扩展到第一个对象身上。
        for (; i < length; i++) {
            //遍历对象的所有可枚举属性
            var option = arguments[i];
            if (!option) {
                continue;
            }
            for (var key in option) {
                var src = target[key];
                var copy = option[key];

                if (deep) {
                    var clone = null;
                    //注意由于Array的typeof结果也是object，所以将数组类型的判断放在Object类型判断之前。
                    if (jQuery.isArray(copy)) {
                        clone = src && jQuery.isArray(src) ? src : []; //即如果待合并的属性值为Array，则原对象对应的属性也得是Array，否则就会舍弃原对象上的这个属性值。
                    } else if (jQuery.isPlainObject(copy)) {
                        clone = src && jQuery.isPlainObject(src) ? src : {};   //即如果待合并的属性值为Object，则原对象对应的属性也得是Object，否则就会舍弃原对象上的这个属性值。
                    } else {
                        target[key] = copy;    //如果待合并的属性值既不是Object也不是Array，则浅拷贝.
                        continue;
                    }
                    target[key] = jQuery.extend(deep, clone, copy);
                } else {
                    target[key] = copy;
                }
            }
        }

        return target;
    }

    //这里有一个极容易困惑的问题：extend方法的定义中用到了isPlainObject、isArray，而这两个方法又是通过extend方法扩展得到的,看起来
    //好像是互相调用有矛盾？但实际上不是的，因为isPlainObject、isArray这两个方法的扩展是在加载jquery时完成，此时调用jQuery.extend()
    // 但做的是浅表拷贝，并不会走到if(deep)的分支中去，所以说并不会造成冲突。但是实际开发中尽量少这么用，容易引发疑问！
    jQuery.extend({
        makeArray: function (arr) {
            var result = [];
            if (arr && arr.length) {
                result = jQuery.merge(result, arr);
            }
            return result;
        },
        merge: function (arg1, arg2) {
            var l = arg1.length;
            var m = arg2.length;
            var n = 0;
            if (typeof arg2.length === "number") {
                for (; n < m; n++) {
                    arg1[l++] = arg2[n];
                }
            } else {  //支持arg2格式：{"0":xxx,"1":xxx,"2":xxx}
                while (arg2[n] !== undefined) {
                    arg1[l++] = arg2[n++];
                }
            }

            //修正arg1的length
            arg1.length = l;
            return arg1;
        },
        isPlainObject: function (obj) {
            return typeof obj === "object";
        },
        isArray: function (obj) {
            return toString.call(obj) === "[object Array]";
        }
    });


    jQuery.fn.init.prototype = jQuery.fn;
    window.$ = window.jQuery = jQuery;
})(this);