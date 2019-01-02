define(["jquery"], function ($) {
    var makeList = function () {
        //创建表格示例
        var dataList = [
            {
                name: "宋远桥",
                age: "60",
                rank: "大师兄",
                org: "武当派"
            },
            {
                name: "俞莲舟",
                age: "50",
                rank: "二师兄",
                org: "武当派"
            },
            {
                name: "俞岱岩",
                age: "45",
                rank: "三师兄",
                org: "武当派"
            },
            {
                name: "张松溪",
                age: "42",
                rank: "四师兄",
                org: "武当派"
            },
            {
                name: "张翠山",
                age: "38",
                rank: "五师兄",
                org: "武当派"
            },
            {
                name: "殷梨亭",
                age: "32",
                rank: "六师兄",
                org: "武当派"
            },
            {
                name: "莫声谷",
                age: "30",
                rank: "七师兄",
                org: "武当派"
            }
        ]

        //创建表格并添加到容器
        $("#container").append("<table id='wd'></table>");
        //添加表头
        var head = "<tr id='headLine'><td>序号</td><td>姓名</td><td>年龄</td><td>排名</td><td>门派</td></tr>";
        $("#wd").append(head);
        $("#headLine").css({fontWeight:"bold"});

        //遍历集合创建数据行
        for (var i = 0; i < dataList.length; i++) {
            var data = dataList[i];
            var tr = `<tr><td>${i+1}</td><td>${data.name}</td><td>${data.age}</td><td>${data.rank}</td><td>${data.org}</td></tr>`;
            $("#wd").append(tr);
        }
    };

    return {
        makeList: makeList
    }
})