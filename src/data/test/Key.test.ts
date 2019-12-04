import test from "ava"
import Model from "../Model"
import Entity from "../Entity"
import Key from "../Key"
import clonePatch from "../../utility/clonePatch"

class Person extends Entity {
    @Model.property({ type: "string" })
    name!: string
}

class Pet extends Entity {
    @Model.property({ type: "string" })
    name!: string
}

let namespace = { Person, Pet }

test("key", t => {
    let owner = Key.create(Person, "kris")
    t.deepEqual(owner.parent, null)
    t.deepEqual(owner.query, {})
    t.deepEqual(owner.id, "kris")
    t.deepEqual(owner.toString(), "Person/kris")

    let pet1 = Key.parse(namespace, owner, Pet, "fido")
    t.deepEqual(pet1.toString(), "Person/kris/Pet/fido")
    t.deepEqual(pet1.parent, owner as any)

    let petSearch = Key.parse(namespace, owner, Pet, { where: { name: "Fido" } })
    t.deepEqual(petSearch.toString(), `Person/kris/Pet?{"where":{"name":"Fido"}}`)

    // test query paths
    let name = Key.create(Person, "Kris", ["name"])
    t.deepEqual(name.toString(), 'Person/Kris?{"path":["name"]}')
    let kris = new Person({ id: "Kris", name: "Kris Nye" })
    t.deepEqual(name.get(kris), "Kris Nye")
    t.deepEqual(name.patch(kris, "Kris Nilsen"), new Person({ id: "Kris", name: "Kris Nilsen" }))
    t.deepEqual(clonePatch(kris, name.patch("Foo")), new Person({ id: "Kris", name: "Foo" }))

    t.deepEqual(name, Key.parse(namespace, "Person/Kris?name"))
    t.deepEqual(name, Key.parse(namespace, "Person/Kris?/name"))


})
