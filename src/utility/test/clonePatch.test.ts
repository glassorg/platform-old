import test from "ava"
import clonePatch from "../clonePatch"
import Patch from "../../data/Patch"

class Foo {
    foo = 10
    constructor(props) {
        Object.freeze(Object.assign(this, props))
    }
}

class Bar {
    bar = 10
    constructor(props) {
        Object.freeze(Object.assign(this, props))
    }
}

test("clonePatch", t => {
    let foo = new Foo({ x: 1, y: 2, bar: new Bar({ a: 10, b: 20 }) })
    let foo2 = clonePatch(foo, {x: 5, bar: { b: 40 }})
    t.deepEqual(foo2, new Foo({ x: 5, y: 2, bar: new Bar({ a: 10, b: 40 }) }))
    t.true(clonePatch(foo, null) === null)
    t.true(clonePatch(foo, {}) === foo)
    t.true(clonePatch(foo, "foo") === "foo")
    t.true(clonePatch(foo, 12) === 12)
    t.true(clonePatch(foo, false) === false)
    t.deepEqual(clonePatch([1, 2], { 2: 3 }), [1, 2, 3])
    let bar = new Foo({ x: 10 })
    let bar2 = clonePatch(bar, { x: null })
    t.deepEqual(bar2, new Foo({}))
    // make sure a delete value command like bar: null can't slip through into value
    t.deepEqual(clonePatch({}, { foo: { bar: null} }), {foo: {}})
})
