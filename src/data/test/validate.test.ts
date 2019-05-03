import test from "ava"
import Entity from "../Entity"
import validate from "../schema/validate"
import Key from "../Key"
import Model from "../Model"
import User from "../../model/User"
import * as schema from "../schema"

@Model.class()
class ValidateAnimal extends Entity {
}

@Model.class()
class ValidatePerson extends Entity {

    @Model.property(schema.string, {required: true, coerce(value) { return value.trim() } })
    name!: string

    @Model.property(schema.date)
    birthDate!: string

    @Model.property(schema.integer, { default: 7, maximum: 8})
    favoriteNumber!: number

    @Model.property(schema.array, { items: { type: "integer" } })
    array!: number

    @Model.property(schema.string, { pattern: /Dark Souls|Bloodbourne|XCOM/ })
    favoriteGame!: string

    @Model.property(schema.string, { enum: ["Aliens", "Zoolander", "The Princess Bride"] })
    favoriteMovie!: string

    @Model.property(
        schema.string, {
        validate(value) {
            if (value !== value.toLowerCase())
                return "Value is not lowercase"
            return true
        }
    })
    customValue!: string
}

test("can construct valid model", t => {
    t.notThrows(() => {
        let modified = { by: "kody.j.king@gmail.com", date: Date.parse("1995-09-25T12:00:00") }
        new ValidatePerson({ key: "ValidatePerson/kody", name: "Kody King  ", birthDate: "1995-09-25", favoriteNumber: 8, created: modified, updated: modified, array: [12, 20, 13], customValue: "foo" })
    })
})

test("can not construct invalid model", t => {
    t.notThrows(() => {
        let modified = { by: "kody.j.king@gmail.com", date: Date.parse("1995-09-25T12:00:00") }
        new ValidatePerson({ key: "ValidatePerson/kody", name: "Kody King  ", birthDate: "1995-09-25", favoriteNumber: 8, created: modified, updated: modified, array: [12, 20, 13], customValue: "foo" })
    })
})

test("additional property should throw", t => {
    t.throws(() => {
        let modified = { by: "kody.j.king@gmail.com", date: Date.parse("1995-09-25T12:00:00") }
        new ValidatePerson({ key: "ValidatePerson/kody", name: "Kody King", birthDate: "1995-09-25", favoriteNumber: 8, created: modified, updated: modified, array: [12, 20, 13], additional: "property" })
    })
})

test("custom value should fail with specific message", t => {
    t.deepEqual(validate(ValidatePerson.properties.customValue as schema.Schema, "Foo"), ["Value is not lowercase"])
})

test("dateFormatFail", t => {
    t.throws(() => {
        new ValidatePerson({ key: "ValidatePerson/kody", name: "Kody King", birthDate: "1995-09-25notADate" })
    })
})

test("explicitKey", t => {
    t.notThrows(() => {
        new ValidatePerson({ key: Key.create(ValidatePerson, "kody"), name: "Kody King" })
    })
})

test("explicitKeyWrongType", t => {
    t.throws(() => {
        new ValidatePerson({ key: Key.create(ValidateAnimal, "kody"), name: "Kody King" })
    })
})

test("customPattern", t => {
    t.notThrows(() => {
        new ValidatePerson({ key: "ValidatePerson/kody", name: "Kody King", favoriteGame: "Dark Souls" })
    })
})

test("customPatternFail", t => {
    t.throws(() => {
        new ValidatePerson({ key: "ValidatePerson/kody", name: "Chody King", favoriteGame: "Skyrim" })
    })
})

test("enumFail", t => {
    t.throws(() => {
        new ValidatePerson({ key: "ValidatePerson/kody", name: "Chody King", favoriteMovie: "Star Wars Episode 1" })
    })
})

test("requiredFail", t => {
    t.throws(() => {
        new ValidatePerson({})
    })
})

test("validateItems no implicit additionalProperties", t => {
    t.true(validate({ properties: { x: {}, y: {} } }, { x: 1, y: 2, z: 3 }).length > 0)
})

test("validateType", t => {
    t.true(validate({ type: "string" }, "foo").length === 0)
    t.true(validate({ type: ["integer", "string"] }, "foo").length === 0)
    t.true(validate({ type: ["integer", "string"] }, 4.5).length === 1)
})

test("validateItems", t => {
    t.true(validate({ items: { type: "string" } }, []).length === 0)
    t.true(validate({ items: { type: "string" } }, ["foo"]).length === 0)
    t.true(validate({ items: { type: "string" } }, [12]).length === 1)
    t.true(validate({ items: [{ type: "string" }, { type: "integer" }] }, []).length === 0)
    t.true(validate({ items: [{ type: "string" }, { type: "integer" }], minItems: 2 }, []).length === 1)
    t.true(validate({ items: [{ type: "string" }, { type: "integer" }], minItems: 2 }, ["a", 10]).length === 0)
})
test("validateItems no implicit additionalItems", t => {
    t.true(validate({ items: [{ type: "string" }, { type: "integer" }] }, ["a", 10, 20]).length === 1)
})
test("validateItems maxItems", t => {
    t.true(validate({ items: [{ type: "string" }, { type: "integer" }] }, ["a", 10, 20]).length === 1)
})
test("not", t => {
    t.true(validate({ not: {} }, ["a", 10, 20]).length === 1)
})

class TestClass {
}

test("class", t => {
    t.true(validate({ type: TestClass }, new TestClass()).length === 0)
    t.true(validate({ type: TestClass }, {}).length === 1)
})

test("User.email", t => {
    t.throws(() => new User({ key: Key.create(User, "invalid email"), name: "Kris", mobile: "1111111111", passwordHash: "" }))
    t.notThrows(() => new User({ key: Key.create(User, "valid@email.com"), name: "Kris", mobile: "1111111111", passwordHash: "" }))
})
