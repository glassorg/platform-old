import test from "ava";
import Firestore, { getIndexedValues } from "./Firestore";
import Entity from "../../data/Entity";
import Model from "../../data/Model";
import Key from "../../data/Key";
import Database from "./Database";

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
        default: false,
        index: true
    })
    complete!: boolean

    @Model.property({ index: true })
    get computed() { return 10 }
}

const namespace = { TestEntity }

test("indexes", assert => {
    let modified = { by: "krisnye@gmail.com", date: Date.parse("1971-12-09T12:00:00") }
    let kris = new TestEntity({ key: "TestEntity/kris", name: "Kris", complete: true, created: modified, updated: modified })
    let indexes = getIndexedValues(kris)
    assert.deepEqual(
        indexes,
        {
            "name": kris.name,
            "complete": true,
            "computed": 10,
            "created.by": modified.by,
            "created.date": modified.date,
            "updated.by": modified.by,
            "updated.date": modified.date
        }
    )
})

let disableDatabaseTests = true // process.platform !== "darwin"
if (disableDatabaseTests) {
    test("test suspended", assert => {
        console.log("Firestore tests suspended for now")
        assert.true(true)
    })
} else {
    test("create, delete and query entities", async function(assert) {
        assert.plan(13)
        let modified = { by: "krisnye@gmail.com", date: Date.parse("1971-12-09T12:00:00") }
        let kris = new TestEntity({ key: "TestEntity/kris", name: "Kris", complete: true, created: modified, updated: modified })
        let kody = new TestEntity({ key: "TestEntity/kody", name: "Kody", complete: true, created: modified, updated: modified, deleted: modified })
        let orion = new TestEntity({ key: "TestEntity/orion", name: "Orion", complete: true, created: modified, updated: modified })
        let entities = [kris, kody, orion]
        let database: Database = new Firestore({ namespace, projectId: "kris-firestore", hardDelete: false })
        try {
            let result = await database.put(entities)
            assert.true(result === undefined)
        } catch (e) {
            console.error(e)
            assert.fail(e)
        }
        let one = await database.get<TestEntity>(kris.key)
        assert.true(one != null)
        assert.deepEqual(one!.name, kris.name)
        let two = await database.get<TestEntity>(kody.key)
        assert.true(two != null)
        assert.true(two!.deleted != null)

        //  Test indexed queries, shouldn't find deleted one
        let result = await database.query(Key.create(TestEntity, { where: { complete: true }}))
        assert.deepEqual(result.length, 2)
        assert.deepEqual(result[0].name, kris.name)
        assert.deepEqual(result[1].name, orion.name)

        //  Test limited query
        result = await database.query(Key.create(TestEntity, { where: { complete: true }, limit: 1}))
        assert.deepEqual(result.length, 1)
        assert.deepEqual(result[0].name, kris.name)

        //  Test offset query
        result = await database.query(Key.create(TestEntity, { where: { complete: true }, offset: 1}))
        assert.deepEqual(result.length, 1)
        assert.deepEqual(result[0].name, orion.name)
        
        // now test hard delete
        database = new Firestore({ ...database, hardDelete: true } as any)
        await database.put([new TestEntity({...orion, deleted: true})])
        let deletedResult = await database.get<TestEntity>(orion.key)
        assert.true(deletedResult === null)
    })
}

