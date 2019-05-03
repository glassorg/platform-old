import test from "ava"
import Model from "../Model"
import Entity from "../Entity"
import Key from "../Key"

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
    t.true(owner.parent === null)
    t.true(owner.query === null)
    t.true(owner.id === "kris")
    t.true(owner.toString() === "Person/kris")

    let pet1 = Key.parse(namespace, owner, Pet, "fido")
    t.true(pet1.toString() === "Person/kris/Pet/fido")
    t.deepEqual(pet1.parent, owner as any)

    let petSearch = Key.parse(namespace, owner, Pet, { where: { name: "Fido" } })
    t.true(petSearch.toString() === `Person/kris/Pet?{"where":{"name":"Fido"}}`)
})
