import test from "ava"
import Model from "../Model"
import Entity from "../Entity"
import Serializer from "../Serializer"
import { AssertionError } from "assert";

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

}

class Foo extends SerializerPerson {
}

const namespace = { SerializerPerson }
const { stringify, parse } = new Serializer(namespace, { indent: 4 })

// test("Serializer Compression", t => {
//     let entity = new SerializerPerson({ key: "SerializerPerson/kris", name: "Kris Nye", birthDate: "1990-12-05", favoriteNumber: 69, array: [4,2]})
//     t.true(entity != null)
//     let compressor = new Serializer(namespace, { compress: true })
//     // let compressed = compressor.stringify(entity)
//     t.notDeepEqual(stringify(entity), compressor.stringify(entity))
//     // make sure we can decompress an uncompressed entity
//     t.deepEqual(entity, compressor.parse(stringify(entity)))
//     // make sure we can decompress a compressed entity
//     t.deepEqual(entity, compressor.parse(compressor.stringify(entity)))
// })

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
    let persons = [new SerializerPerson({ key: "SerializerPerson/kris", name: "Kris Nye", birthDate: "1971-12-09", created: modified, updated: modified, array: [12, 20, 13] })]
    t.true(persons[0].favoriteNumber === 7)
    let personString = stringify(persons)
    let parsedSerializerPerson = parse(personString)
    t.deepEqual(persons, parsedSerializerPerson)
})

