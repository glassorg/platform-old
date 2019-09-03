import test from "ava"
import MemoryStore from "../MemoryStore"
import Model from "../../Model"
import Key, { ModelKey } from "../../Key"
import Store from "../../Store"

test("Primitive keys", t => {
    let primitiveKey = Key.create<string>({ name: "Foo", store: "memory", type: "string", default: "bar" }, "singleton")
    let store = new MemoryStore()
    let value = store.peek(primitiveKey)
    t.deepEqual(value, primitiveKey.schema.default)
    store.patch(primitiveKey, "foo")
    value = store.peek(primitiveKey)
    t.deepEqual(value, "foo")
    // make sure it validates so you cannot set invalid types
    t.throws(() => {
        store.patch(primitiveKey, 12)
    })
})

class Person extends Model {

    @Model.property({ type: "string", required: true, coerce(value) { return value.trim() } })
    name!: string
}

test("Query peeking", t => {
    let store = new MemoryStore()
    let query = Key.create(Person, {})
    let persons = store.peek(query)
    t.deepEqual(persons, [])
    store.patch(Key.create(Person, "Kris"), { name: "Kris" })
    persons = store.peek(query)
    t.true(JSON.stringify(persons) === JSON.stringify(["Person/Kris"]))
    store.patch(Key.create(Person, "Kody"), { name: "Kody" })
    persons = store.peek(query)
    t.true(JSON.stringify(persons) === JSON.stringify(["Person/Kris", "Person/Kody"]))
})

test("Where Query peeking", t => {
    let store = new MemoryStore()
    let query = Key.create(Person, { where: { name: "Kody" }})
    let persons = store.peek(query)
    t.deepEqual(persons, [])
    store.patch(Key.create(Person, "Kris"), { name: "Kris" })
    persons = store.peek(query)
    t.true(JSON.stringify(persons) === JSON.stringify([]))
    store.patch(Key.create(Person, "Kody"), { name: "Kody" })
    persons = store.peek(query)
    t.true(JSON.stringify(persons) === JSON.stringify(["Person/Kody"]))
})

test("Full Query watching", t => {
    let persons: Array<ModelKey<Person>> | undefined
    let store: Store = new MemoryStore()
    store.watch(Key.create(Person, {}), (value) => {
        persons = value
    })
    t.deepEqual(persons, [])
    store.patch(Key.create(Person, "Kris"), { name: "Kris" })
    t.true(JSON.stringify(persons) === JSON.stringify(["Person/Kris"]))
    store.patch(Key.create(Person, "Kody"), { name: "Kody" })
    t.true(JSON.stringify(persons) === JSON.stringify(["Person/Kris", "Person/Kody"]))
})

test("readListeners see query key gets and regular gets", t => {
    let readKeys: string[] = []
    let store: Store = new MemoryStore()
    store.addReadListener((key) => {
        readKeys.push(key.string)
    })

    let queryKey = Key.create(Person, { where: { name: "Kris" }})
    store.get(queryKey)
    t.deepEqual(readKeys, [queryKey.string])

    let singleKey = Key.create(Person, "Kris")
    store.get(singleKey)
    t.deepEqual(readKeys, [queryKey.string, singleKey.string])
})