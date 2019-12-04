import test from "ava"
import JSONPointer, { parse, get, set, patch, stringify } from "../JSONPointer"

const doc = {
    name: "Kris",
    children: [
        {
            name: "Sadera",
            birth: 1996
        },
        {
            name: "Orion",
            birth: 1998
        }
    ]
}

const doc2 = {
    "foo": ["bar", "baz"],
    "": 0,
    "a/b": 1,
    "c%d": 2,
    "e^f": 3,
    "g|h": 4,
    "i\\j": 5,
    "k\"l": 6,
    " ": 7,
    "m~n": 8
}

test("pointer", t => {
    t.deepEqual(get(doc, []), doc)
    t.deepEqual(get(doc, parse("")), doc)
    t.deepEqual(get(doc, ["children", 0]), doc.children[0])
    t.deepEqual(get(doc, ["children", 1]), doc.children[1])
    t.deepEqual(get(doc, parse("children/0")), doc.children[0])
    t.deepEqual(get(doc, parse("children/1")), doc.children[1])

    t.deepEqual(get(doc2, parse("")), doc2)
    t.deepEqual(get(doc2, parse("/foo")), ["bar", "baz"])
    t.deepEqual(get(doc2, parse("/foo/0")), "bar")
    t.deepEqual(get(doc2, parse("/")), 0)
    t.deepEqual(get(doc2, parse("/a~1b")), 1)
    t.deepEqual(get(doc2, parse("/c%d")), 2)
    t.deepEqual(get(doc2, parse("/e^f")), 3)
    t.deepEqual(get(doc2, parse("/g|h")), 4)
    t.deepEqual(get(doc2, parse("/i\\j")), 5)
    t.deepEqual(get(doc2, parse("/k\"l")), 6)
    t.deepEqual(get(doc2, parse("/ ")), 7)
    t.deepEqual(get(doc2, parse("/m~0n")), 8)

    t.deepEqual(stringify(["/", "~"]), "/~1/~0")

    //  test setting values
    t.deepEqual(set({ foo: { bar: 12 }}, parse("/foo/bar"), 45), { foo: { bar: 45 } })
    //  test patching values
    t.deepEqual(patch({ foo: { bar: 12 }}, parse("/foo/bar"), 45), { foo: { bar: 45 } })
})
