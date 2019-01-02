define("a", [], function () {
    //逻辑处理
    var person = {
        name: "tom",
        age: 20,
        place: "软件园"
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