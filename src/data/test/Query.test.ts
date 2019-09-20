import test from "ava"
import Model from "../Model"
import Entity from "../Entity"
import Key from "../Key"
import { object } from "../schema"
import { createSortCompareFunction } from "../Query"

class Person extends Model {
    @Model.property(object)
    recursive
}

test("Query.sort", t => {
    let alpha = new Person({ recursive: { name: "Alpha" }})
    let beta = new Person({ recursive: { name: "Beta" }})
    let charlie = new Person({ recursive: { name: "Charlie" }})
    let unsorted = [charlie, alpha, beta]
    let sorted = unsorted.slice(0).sort(createSortCompareFunction({ sort: [{ "recursive.name": true }] }))
    t.deepEqual(sorted, [alpha, beta, charlie])
})
