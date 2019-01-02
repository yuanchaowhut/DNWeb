define("b", [], function () {
    //逻辑处理
    var person = {
        name: "kate",
        age: 19,
        place: "武大园"
    }
    var work = function () {
        console.log(person.name + "在" + person.place + "上班");
    }

    //暴露接口对象
    return {
        person: person,
        work: work
    }
})