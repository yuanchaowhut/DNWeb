(function (root) {
    var modMap = {}; //缓存( 模块的名称:{状态,依赖,接口对象})
    //初始化
    var requireUse = function (deps, callback) {
        if (deps.length === 0) {
            callback();
        }
        var depsLen = deps.length;
        var params = [];
        for (var i = 0; i < deps.length; i++) {
            (function (j) {
                loadMod(deps[j], function (obj) {
                    depsLen--;
                    params[j] = obj;
                    if (depsLen === 0) {
                        callback.apply(null, params);
                    }
                });
            })(i);
        }
    }

    var loadMod = function (name, callback) {
        if (!modMap[name]) {
            modMap[name] = {
                status: 'loading'
            }
            //加载模块
            loadScript(name, function () {
                requireUse(modMap[name].deps, function () {
                    //获取接口对象,执行顺序依次为：a, b, c
                    execMod(name, callback);
                });
            });
        }
    }


    //注入script标签
    var loadScript = function (name, callback) {
        var doc = document;
        var node = doc.createElement("script");
        node.src = name + ".js";
        doc.body.appendChild(node);
        //截止到这一步<script src="xxx.js"><script> 也即xxx模块加载成功,只要xxx模块遵循了amd规范，
        //则加载成功时，xxx模块内部就会调用define()，就会在modMap中扩展一系列属性.
        node.onload = function () {
            callback();
        }
    }

    var execMod = function (name, callback) {
        var obj = modMap[name].callback();
        modMap[name].exports = obj;
        callback(obj);
    }

    //定义模块
    var define = function (name, deps, callback) {
        modMap[name] = modMap[name] || {};
        modMap[name].status = "loaded";
        modMap[name].deps = deps;
        modMap[name].callback = callback;
    }

    root.requireUse = requireUse;
    root.define = define;
})(this);