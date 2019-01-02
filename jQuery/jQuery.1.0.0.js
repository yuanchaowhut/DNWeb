/*
* @Author: Administrator
* @Date:   2018-10-30 20:40:51
* @Last Modified by:   Max
* @Last Modified time: 2018-11-06 22:21:17
*/
(function (root) {
    var testExp = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/;
    var rejectExp = /^<(\w+)\s*\/?>/;  //"<>"
    var rootjQuery;
    var jQuery = function (seletor, context) {    //构造函数  函数对象
        return new jQuery.prototype.init(seletor, context, rootjQuery);
    }

    jQuery.fn = jQuery.prototype = {  //原型对象
        length: 0,
        init: function (seletor, context, rootjQuery) {
            var match, elem;
            //$()  $(undefined)  $(null) $(false)
            if (!seletor) {
                return this;
            }

            if (typeof seletor === "string") {
                //判断  字符串  #xxx  .xxxx html字符串 $("<div>")
                if (seletor.charAt(0) === "<" && seletor.charAt(seletor.length - 1) === ">" && seletor.length >= 3) {
                    match = [null, seletor, null]   //"<div></div>"
                } else {
                    match = testExp.exec(seletor);
                }
                //创建DOM
                if (match[1]) {
                    jQuery.merge(this, jQuery.parseHTML(seletor, context && context.nodeType ? context : document));   //arg1 arg2  this   object  Element对象

                } else {   //查询DOM
                    elem = document.getElementById(match[2]);  //box
                    if (elem, elem.nodeType) {
                        this.length = 1;
                        this[0] = elem;
                    }
                    this.context = document;
                    this.seletor = seletor;
                    return this;
                }
            } else if (seletor.nodeType) {    //对象||函数    this   document  window
                this.context = this[0] = seletor;
                this.length = 1;
                return this;
            } else if (jQuery.isFunction(seletor)) {
                //DOMContentLoaded  事件
                rootjQuery.ready(seletor);
            }
        },
        css: function (name, value) {
            //根据参数来判断用户的行为
            /*
             this  jQuery实例对象
             name   属性
             value  属性的值
             callback   根据判断的结果来进行具体的执行


             */
            return jQuery.access(this, name, value, function (elem, name, value) {

                if (value === undefined) {
                    //get 返回Elment某个css样式属性的值
                    return jQuery.curCSS(elem, name);
                }
                // 重置Elment某个css样式属性的值
                jQuery.style(elem, name, value);
            });
        },

        //text  作业 方法实现下   bug
        text: function (value) {
            return jQuery.access(this, value, function (elem, value) {
                value === undefined ? get : set
            });
        },

        ready: function (fn) {
            //检测DOM是否加载完毕
            document.addEventListener("DOMContentLoaded", jQuery.ready)
            //jQuery.isReady  true
            if (jQuery.isReady) {
                fn.call(document, jQuery);
            } else {
                jQuery.readyList.push(fn);
            }
        }
    }

    jQuery.fn.init.prototype = jQuery.fn;

    /*
      工具函数   $.extend()  this  $.fn.extend()  this
      1：参数必须为引用类型    2：参数不能为空
     */
    jQuery.extend = jQuery.prototype.extend = function () {
        var target = arguments[0] || {};   //arguments[0]  false  null  undefined
        var length = arguments.length;
        var i = 1;
        var deep = false;    //默认为浅拷贝
        var option;
        var name;
        var copy;
        var src;
        var copyIsArray;
        var clone;

        if (typeof target === "boolean") {   //$.extend(true,obj,result);
            deep = target;
            target = arguments[1];   // target  不改变他的引用
            i = 2;
        }

        if (typeof target !== "object") {
            target = {};
        }

        //参数1   实例扩展  本身扩展
        if (length == i) {
            target = this;
            i--;   //0
        }

        //参数2以上   任意对象扩展 (arguments[0])  1  $.extend(obj,result);
        for (; i < length; i++) {
            if ((option = arguments[i]) !== null) {
                for (name in option) {
                    src = target[name];   // obj.list
                    copy = option[name];
                    //result.age   result.sex  result.list
                    //deep true 深拷贝
                    if (deep && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {   //true 被拷贝的值是个数组 []
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];
                        } else {   // 被拷贝的值是个对象 {}
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }
                        target[name] = jQuery.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;    //age  sex  list
                    }
                }
            }
        }
        return target;
    }


    jQuery.extend({
        //类型检测的方法    object对象
        isPlainObject: function (obj) {
            return toString.call(obj) === "[object Object]";
        },

        isArray: function (obj) {   //array对象
            return toString.call(obj) === "[object Array]";
        },

        isFunction: function (seletor) {
            return typeof seletor === "function";
        },
        //类数组转化成正真的数组  arguments.length  nodeList.length
        //Array.form(arguments)
        markArray: function (arr) {
            var result = [];
            if (arr && arr.length) {
                return jQuery.merge(result, arr);
            }

        },

        //合并数组
        merge: function (arg1, arg2) {   // this  {}
            var i = arg1.length;   //0
            var l = arg2.length;
            console.log(l)
            var j = 0;
            if (typeof l === "number") {
                for (; j < l; j++) {
                    arg1[i++] = arg2[j];
                }
            } else {     //{"0":"max","1":"star","2":"Ariel"}  "0" "1" "2"
                while (arg2[j] !== undefined) {
                    arg1[i++] = arg2[j++];
                }
            }
            return arg1;
        },

        parseHTML: function (data, context) {
            console.log(data)
            if (!data || typeof data !== "string") {
                return null;
            }
            //过滤掉<div></div>
            var parse = rejectExp.exec(data);
            console.log(parse)
            return [context.createElement(parse[1])];   //createElement(<div>)
        },
        /*
         object   目标源
         callback  回调函数
         args     自定义回调函数参数
         */
        each: function (object, callback, args) {
            //object  数组对象 || object对象
            var length = object.length;
            var name, i = 0;

            // 自定义callback 参数
            if (args) {
                if (length === undefined) {
                    for (name in object) {
                        callback.apply(object, args);
                    }
                } else {
                    for (; i < length;) {
                        callback.apply(object[i++], args);
                    }
                }
            } else {
                if (length === undefined) {
                    for (name in object) {
                        callback.call(object, name, object[name]);
                    }
                } else {
                    for (; i < length;) {
                        callback.call(object[i], i, object[i++]);
                    }
                }
            }
        },
        isReady: false,
        readyList: [],    //回调列表
        ready: function () {
            jQuery.isReady = true;
            //jQuery.each(readyList);
            console.log(jQuery.readyList)
            jQuery.each(jQuery.readyList, function (i, fn) {
                this.call(document);
            });

            jQuery.readyList = null;
        },

        access: function (elems, key, value, fn) {
            var length = elems.length;
            var deep = true;
            var name;
            //判断用户是要get  set
            //set  1
            if (typeof key === "object") {
                deep = false;
                //递归
                for (name in key) {
                    jQuery.access(elems, name, key[name], fn);
                }
            }
            //set 2
            if (value !== undefined) {
                //elems jQuery实例对象
                deep = false;
                for (var i = 0; i < length; i++) {
                    fn(elems[i], key, value);
                }

            }
            //get 返回  length==1
            if (length && deep) {
                return fn(elems[0], key);
            } else {
                return undefined;
            }
        },

        curCSS: function (elem, name) {
            var CSSStyleDeclaration, result;
            if (getComputedStyle) {
                var CSSStyleDeclaration = document.defaultView.getComputedStyle(elem, null);
                result = CSSStyleDeclaration.getPropertyValue(name);
            }

            return result;
        },

        style: function (elem, name, value, elems) {
            if (value !== undefined) {
                elem.style[name] = value;
            }

            return elems;
        }


    });
    // jquery 库所有使用实例对象都指向于此
    rootjQuery = jQuery(document);    //$
    root.$ = root.jQuery = jQuery;
})(this);    //window


