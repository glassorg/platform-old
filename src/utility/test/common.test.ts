import test from "ava"
import * as common from "../common"

let count = 0

const double = common.memoize(
    function(value) {
        count++
        return value * 2
    }
)

test("memoize", t => {
    count = 0
    t.true(2 === double(1))
    t.true(2 === double(1))
    t.true(2 === double(1))
    t.true(6 === double(3))
    t.true(6 === double(3))
    t.true(6 === double(3))
    t.true(count === 2)
})

test("getPath", t => {
    let ancestor = [
        { x: { a: 12 } },
        { y: { b: 20 } }
    ]
    t.deepEqual(["0", "x", "a"], common.getPath(ancestor, 12))
    t.deepEqual(["1", "y", "b"], common.getPath(ancestor, 20))
    t.deepEqual(["0"], common.getPath(ancestor, ancestor[0]))
    t.deepEqual([], common.getPath(ancestor, ancestor))
})