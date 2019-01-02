define("c", ['a', 'b'], function (a, b) {
    //逻辑处理
    var work = function () {
        var name1 = a.person.name;
        var name2 = b.person.name;
        var place1 = a.person.place;
        var place2 = b.person.place;

        console.log(name1 + "和" + name2 + "分别在" + place1 + "和" + place2 + "工作!");

        a.work();
        b.work();
    }

    //暴露接口对象
    return {
        work: work
    }
})