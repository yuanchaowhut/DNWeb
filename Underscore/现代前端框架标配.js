(function (root) {

    var _ = function () {
        //客户端使用 _()，第一次调用时，this指向的是window，执行结果return new _()，再次调用了_()，this指向的就是 _ 的一个实例了。
        //由于instanceof判断的存在，就不会再进if内部，从而避免了循环调用。
        console.log(this);
        if (!(this instanceof _)) {
            return new _();
        }
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


    _.uniq = function () {

    };

    _.prototype.uniq = function () {

    };

    return _;
})(this);