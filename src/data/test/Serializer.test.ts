import test from "ava"
import Model from "../Model"
import Entity from "../Entity"
import Serializer from "../Serializer"

@Model.class()
export default class SerializerPerson extends Entity {

    @Model.property({ type: "string" })
    name!: string

    @Model.property({ type: "string", format: "date" })
    birthDate!: string

    @Model.property({ type: "integer", default: 7 })
    favoriteNumber!: number

    @Model.property({ type: "array", items: { type: "integer" } })
    array!: number

}

class Foo extends SerializerPerson {
}

const namespace = { SerializerPerson }
const { stringify, parse } = new Serializer(namespace)

test("SerializerPerson has registered with Model.serializer", t => {
    t.true(Model.serializer.namespace.SerializerPerson === SerializerPerson)
})

test("Model properties have schema name set", t => {
    t.deepEqual(SerializerPerson.properties.name!.name, "name")
    t.deepEqual(SerializerPerson.properties.birthDate!.name, "birthDate")
    t.deepEqual(SerializerPerson.properties.favoriteNumber!.name, "favoriteNumber")
    t.deepEqual(SerializerPerson.properties.array!.name, "array")
})

test("Model class has store", t => {
    t.true(typeof Foo.store === "string")
})

test("Serialization", t => {
    let modified = { by: "krisnye@gmail.com", date: Date.parse("1971-12-09T12:00:00") }
    let person = new SerializerPerson({ key: "SerializerPerson/kris", name: "Kris Nye", birthDate: "1971-12-09", created: modified, updated: modified, array: [12, 20, 13] })
    t.true(person.favoriteNumber === 7)
    let personString = stringify(person)
    let parsedSerializerPerson = parse(personString)
    t.deepEqual(person, parsedSerializerPerson)
})
