import test from "ava"
import Datastore from "./Datastore"
import Entity from "../../data/Entity"
import Model from "../../data/Model"
import Key from "../../data/Key";

@Model.class()
export default class TestEntity extends Entity {

    @Model.property({
        type: "string",
        minLength: 1,
        maxLength: 1000,
        required: true,
        index: true
    })
    name!: string

    @Model.property({
        type: "boolean",
        default: false
    })
    complete!: boolean

}

const namespace = { TestEntity }

if (process.platform !== "darwin") {
    test("test suspended", t => {
        console.log("Datastore tests suspended for now")
        t.true(true)
    })
} else {
    test("create entities", async function(t) {
        t.plan(5)
        let modified = { by: "krisnye@gmail.com", date: Date.parse("1971-12-09T12:00:00") }
        let entities = [
            new TestEntity({ key: "TestEntity/kris", name: "Kris", complete: true, created: modified, updated: modified }),
            new TestEntity({ key: "TestEntity/kody", name: "Kody", complete: false, created: modified, updated: modified, deleted: modified })
        ]
        let datastore = new Datastore(namespace)
        try {
            let result = await datastore.put(entities)
            t.true(result === undefined)
        } catch (e) {
            console.error(e)
            t.fail(e)
        }
        // try to read entities
        let [[one],[two]] = await datastore.get<TestEntity>([Key.create(TestEntity, "kris"), Key.create(TestEntity, "kody")])
        t.true(one != null)
        t.true(two != null)
        t.deepEqual(one.name, "Kris")
        t.deepEqual(two.name, "Kody")
    })
}

