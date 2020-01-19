import test from "ava"
import VertexArray from "../VertexArray"
import VertexFormat from "../VertexFormat"
import VertexElement from "../VertexElement"
import * as GL from "../GL"
import Vector3 from "../../math/Vector3"

test("VertexArray reading and writing", assert => {
    const format = new VertexFormat(
        new VertexElement("position", 3),
        new VertexElement("normal", 3),
        new VertexElement("custom", 1, GL.UNSIGNED_INT)
    )

    // start with minimal capacity
    const v = new VertexArray(format, 1)
    assert.deepEqual(v.capacity, 1)

    v.set(0, "position", new Vector3(1.5, 2.5, 3.5))
    v.set(0, "normal", new Vector3(1.0, 0.0, 0.0))
    v.set(0, "custom", 0xFFFFFFFF)

    assert.deepEqual(v.get(0, "position", Vector3), new Vector3(1.5, 2.5, 3.5))
    assert.deepEqual(v.get(0, "normal", Vector3), new Vector3(1.0, 0.0, 0.0))
    assert.deepEqual(v.get(0, "custom"), 0xFFFFFFFF)
    assert.deepEqual(v.length, 1)
    assert.deepEqual(v.toArray(), [1.5, 2.5, 3.5, 1.0, 0.0, 0.0, 0xFFFFFFFF])

    v.set(1, "position", new Vector3(2.5, 3.5, 4.5))
    v.set(1, "normal", new Vector3(0.0, 1.0, 0.0))
    v.set(1, "custom", 0xFFFFFF00)

    assert.deepEqual(v.get(1, "position", Vector3), new Vector3(2.5, 3.5, 4.5))
    assert.deepEqual(v.get(1, "normal", Vector3), new Vector3(0.0, 1.0, 0.0))
    assert.deepEqual(v.get(1, "custom"), 0xFFFFFF00)
    assert.deepEqual(v.length, 2)
    //  this ensures that we still retain earlier
    //  values even after resizing to a larger capacity
    const expected = [
        1.5, 2.5, 3.5, 1.0, 0.0, 0.0, 0xFFFFFFFF,
        2.5, 3.5, 4.5, 0.0, 1.0, 0.0, 0xFFFFFF00,
    ]
    assert.deepEqual(v.toArray(), expected)

    // change expected slightly then set it and verify
    expected[0] = 12.5
    v.setData(expected)
    assert.deepEqual(v.capacity, 2)
    assert.deepEqual(v.toArray(), expected)

})
