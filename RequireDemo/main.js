require.config({
    baseUrl: "lib",
    paths: {
        jquery: "jquery-2.1.1",
        underscore: "Underscore",
        list: "../list"
    },
    shim: {
        "underscore": {
            exports: "_"
        }
    }
})


require(["jquery", "underscore", "list"], function ($, underscore, list) {
    //1、全局定义一下，方便调用 【underscore数据结构为： {_:func}】
    window._ = underscore._;
    var arr = [1, 2, 3, 4, 5, 4, 3, 2, 1, 'a', 'A', 'b'];
    var result = _.uniq(arr, function (value) {
        return typeof value === "string" ? value.toLowerCase() : value;
    });
    console.log(result);

    //2、创建表格
    list.makeList();
})