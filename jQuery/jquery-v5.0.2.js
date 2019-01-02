(function (window) {
    //支持的选择器正则表达式
    var testExp = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
    //Html标签正则（<div>）,通过分组过滤掉"<(div)>"中的尖括号.
    var rejectExp = /^<(\w+)\s*\/?>/;
    var spaceExp = /\s+/;  //
    var optionsCache = {};
    var rootjQuery;

    var jQuery = function (selector, context) {
        return new jQuery.prototype.init(selector, context, rootjQuery);    //桥接模式，如果直接return new jQuery() ，则会循环调用报错。
    }


    jQuery.fn = jQuery.prototype = {
        length: 0,   //给jQuery的实例对象扩展一个length属性
        init: function (selector, context, rootjQuery) {
            var match, elem;

            //$(),$(undefined),$(false)之类的
            if (!selector) {                    //是一个字符串
                return this;
            }

            if (typeof selector === "string") {
                //判断  字符串  #xxx  .xxxx html字符串 $("<div>")
                if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
                    match = [null, selector, null];
                } else {
                    match = testExp.exec(selector);
                    // console.log(match);    //["#el", undefined, "el", index: 0, input: "#el", groups: undefined]
                }

                if (match[1]) { //创建Dom
                    jQuery.merge(this, jQuery.parseHTML(selector, context && context.nodeType ? context : document));
                } else { //查询Dom
                    // console.log(match[2]);
                    elem = document.getElementById(match[2]);
                    if (elem && elem.nodeType) {
                        this[0] = elem;
                        this.length = 1;
                    }
                    this.context = document;
                    this.selector = selector;
                    return this;
                }
            } else if (selector.nodeType) {        //是一个element对象
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            } else if (jQuery.isFunction(selector)) {
                //DOMContentLoaded 事件
                rootjQuery.ready(selector);
            }
        },
        ready: function (fn) {
            //检测DOM是否加载完毕
            document.addEventListener("DOMContentLoaded", jQuery.ready);
            if (jQuery.isReady) {
                fn.call(document, jQuery);
            } else {
                jQuery.readyList.push(fn);
            }
        },
        css: function (name, value) {
            //根据参数来判断用户的行为
            /**
             * this  jQuery实例对象
             * name   属性
             * value  属性的值
             * callback   根据判断的结果来进行具体的执行
             */
            return jQuery.access(this, function (elem, name, value) {
                //get
                if (value === undefined) {
                    return jQuery.curCSS(elem, name);
                }
                //set
                jQuery.style(elem, name, value);
            }, name, value);
        },
        text: function (value) {
            var self = this;
            return jQuery.access(this, function (elem, value) {
                if (value === undefined) {
                    return jQuery.text(elem);
                } else {
                    jQuery.empty(elem, value);
                    return self;
                }
            }, value);
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
            return toString.call(obj) === "[object Object]";
        },
        isArray: function (obj) {
            return toString.call(obj) === "[object Array]";
        },
        isFunction: function (selector) {
            return typeof selector === "function";
        },
        parseHTML: function (data, context) {
            // console.log(data);
            var parse = rejectExp.exec(data);  //过滤掉尖括号 <  >
            // console.log(parse);
            return [context.createElement(parse[1])];
        },
        each: function (object, callback, args) {
            var length = object.length;   //根据length判断是对象还是数组
            var name, i = 0;

            //自定义callback的参数
            if (args) {
                if (length === undefined) { //对象
                    for (name in object) {
                        callback.apply(object, args);
                    }
                } else {  //数组
                    for (; i < length; i++) {
                        callback.apply(object[i], args);
                    }
                }
            } else {
                if (length === undefined) {//对象
                    for (name in object) {
                        callback.call(object, name, object[name]);
                    }
                } else { //数组
                    for (; i < length; i++) {
                        callback.call(object[i], i, object[i]);
                    }
                }
            }
        },
        isReady: false,  //Dom是否加载完毕
        readyList: [],   //回调列表
        ready: function () {
            jQuery.isReady = true;
            jQuery.each(jQuery.readyList, function (i, fn) {
                this.call(document);   //这里的this就是指readyList中存储的一个一个回调函数，在each方法中指定。
            });
            jQuery.readyList = null;   //回调函数执行完毕，要清空。
        },
        //access 只负责判断是set还是get，不负责具体业务。
        access: function (elems, fn, key, value) {
            var length = elems.length;
            var name;
            //set1:
            if (typeof key === 'object') {
                for (name in key) {
                    //递归
                    jQuery.access(elems, fn, name, key[name]);
                }
                return elems;
            }
            //set2:
            if (value !== undefined) {
                for (var i = 0; i < length; i++) {
                    fn(elems[i], key, value);
                }
                return elems;
            }

            //get: 返回length=1
            return length ? fn(elems[0], key) : undefined;
        },

        curCSS: function (elem, name) {
            //一般用它也够用了 window.getComputedStyle(element, null)  表示获取最终作用在元素上的css样式.
            var cssObject = elem.currentStyle ? elem.currentStyle : document.defaultView.getComputedStyle(elem, null);
            return cssObject.getPropertyValue(name);
        },
        style: function (elem, name, value) {
            if (value !== undefined) {
                elem.style[name] = value;
            }
        },
        text: function (elem) {
            var nodeType = elem.nodeType;
            if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                return elem.textContent;
            }
        },
        empty: function (elem, value) {
            var nodeType = elem.nodeType;
            if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                elem.textContent = value;
            }
        },
        Callbacks: function (options) {
            options = typeof options === "string" ? (optionsCache[options] || createOptions(options)) : {};
            var list = [];
            var index = 0;       //遍历list的起点
            var size = 0;        //list中元素的个数
            var firing = false;  //是否正在调用fire函数
            var memory, once;

            var self = {
                add: function () {
                    var originLength = list.length;   //add当前callback回调函数之前数组的长度
                    jQuery.each(arguments, function (i, value) {
                        if (jQuery.isFunction(value)) {
                            list.push(value);
                        } else if (jQuery.isArray(value)) {
                            jQuery.each(value, function (i, val) {
                                if (jQuery.isFunction(val)) {
                                    list.push(val);
                                }
                            });
                        }
                    });

                    if (firing) {
                        size = list.length;
                    } else if (memory) {
                        index = originLength;
                        fire(memory);
                    }

                    return this;
                },
                fire: function () {
                    self.fireWith(this, arguments);
                    return this;
                },
                fireWith: function (context, args) {
                    args = [context, args];
                    if (!once) {
                        index = 0;
                        fire(args);
                    }
                }
            };

            function fire(data) {
                firing = true;
                memory = options.memory && data;   //表示如果options.memory为真，则把data赋值给memory变量.
                once = options.once || false;      //once表示只执行一次，默认为false
                size = list.length;
                for (; index < size; index++) {
                    var result = list[index].apply(data[0], data[1]);   //data[0]:上下文, data[1]:回调函数的参数
                    if (result === false && options.stopOnFalse) {
                        break;
                    }
                }
                firing = false;
            }

            return self;
        }
    });

    function createOptions(options) {
        var object = optionsCache[options] = {};
        jQuery.each(options.split(spaceExp), function (i, value) {
            object[value] = true;
        });
        return object;
    }


    jQuery.extend({
        Deferred: function () {
            var state = "peding";

            var promise = {
                state: function () {
                    return state;
                }
            };

            var tuples = [
                ["resolve", "done", jQuery.Callbacks("once memory"), "resolve"],
                ["reject", "fail", jQuery.Callbacks("once memory"), "reject"],
                ["notify", "progress", jQuery.Callbacks("once memory")]
            ];

            jQuery.each(tuples, function (i, tuple) {
                var list = tuple[2];
                //promise.resolve || reject || notify   fire() 回调列表  调用回调列表中的callback
                promise[tuple[0]] = list.fire;
                //promise.resolveWith || rejectWith || notifyWith
                promise[tuple[0] + "With"] = list.fireWith;
                //promise.done || fail || progess   回调列表  add  添加一条callback
                promise[tuple[1]] = list.add;
                var stateString = tuple[3];

                if (stateString) {
                    list.add(function () {
                        state = stateString;
                    });
                }
            });

            return promise;
        },
        when: function (async) {
           return async;   //async实际上就是一个promise对象.
        }
    });

    // rootjQuery = jQuery(document);   //这里注意一个顺序问题，如果放到这里，rootjQuery就只是init()的一个实例，它的原型并没有指向jQuery的原型。
    jQuery.fn.init.prototype = jQuery.fn;
    rootjQuery = jQuery(document);
    window.$ = window.jQuery = jQuery;
})(this);