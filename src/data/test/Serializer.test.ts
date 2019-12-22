import test from "ava"
import Model from "../Model"
import Entity from "../Entity"
import Serializer from "../Serializer"
import Vector3 from "../../ui/math/Vector3"

@Model.class()
export default class SerializerPerson extends Entity {

    @Model.property({ type: "string", id: "a" })
    name!: string

    @Model.property({ type: "string", format: "date", id: "b" })
    birthDate!: string

    @Model.property({ type: "integer", default: 7, id: "c" })
    favoriteNumber!: number

    @Model.property({ type: "array", items: { type: "integer" }, id: "d" })
    array!: number

    @Model.property({ type: Vector3 })
    position?: Vector3

}

class Foo extends SerializerPerson {


}

const namespace = { SerializerPerson, Vector3 }
const { stringify, parse } = new Serializer(namespace, { indent: 4 })

test("Vector Structure Serialization", assert => {
    let vector = new Vector3()
    let string = Serializer.default.stringify(vector)
    assert.true(typeof string === "string")
    let parsed = Serializer.default.parse(string) as Vector3
    assert.deepEqual(vector, parsed)
    assert.true(parsed.constructor === Vector3)
})

test("Vector Nested Types", assert => {
    let foo = new SerializerPerson({ id: "foo", position: new Vector3(10, 20, 30)})
    let string = stringify(foo)
    let parsed = parse(string) as SerializerPerson
    assert.true(parsed.position?.constructor === Vector3)
})

test("SerializerPerson has registered with Model.serializer", assert => {
    assert.true(Model.serializer.namespace.SerializerPerson === SerializerPerson)
})

test("Model properties have schema name set", assert => {
    assert.deepEqual(SerializerPerson.properties.name!.name, "name")
    assert.deepEqual(SerializerPerson.properties.birthDate!.name, "birthDate")
    assert.deepEqual(SerializerPerson.properties.favoriteNumber!.name, "favoriteNumber")
    assert.deepEqual(SerializerPerson.properties.array!.name, "array")
})

test("Model class has store", assert => {
    assert.true(typeof Foo.store === "string")
})

test("Serialization of primitives", assert => {
    let text = "foo"
    let stext = stringify(text)
    let ptext = parse(stext)
    assert.deepEqual(text, ptext)
})

test("Serialization of typed objects", assert => {
    let modified = { by: "krisnye@gmail.com", date: Date.parse("1971-12-09T12:00:00") }
    let persons = [new SerializerPerson({ key: "SerializerPerson/kris", name: "Kris Nye", birthDate: "1971-12-09", created: modified, updated: modified, array: [12, 20, 13] })]
    assert.true(persons[0].favoriteNumber === 7)
    let personString = stringify(persons)
    let parsedSerializerPerson = parse(personString)
    assert.deepEqual(persons, parsedSerializerPerson)
})

