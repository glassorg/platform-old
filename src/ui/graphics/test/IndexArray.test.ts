import test from "ava"
import VertexArray from "../VertexArray"
import VertexFormat from "../VertexFormat"
import VertexElement from "../VertexElement"
import * as GL from "../GL"
import Vector3 from "../../math/Vector3"
import IndexArray from "../IndexArray"

test("IndexArray reading and writing", assert => {
    for (const type of [GL.UNSIGNED_INT, GL.UNSIGNED_SHORT]) {
        const array = new IndexArray(type, 1)
        assert.deepEqual(array.length, 0)
        assert.deepEqual(array.capacity, 1)
        array.set(0, 12)
        assert.deepEqual(array.get(0), 12)
        assert.deepEqual(array.toArray(), [12])

        array.set(1, 69)
        assert.deepEqual(array.length, 2)
        assert.true(array.capacity >= 2)
        assert.deepEqual(array.toArray(), [12, 69])
    }
})
