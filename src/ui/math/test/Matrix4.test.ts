import test from "ava"
import Matrix4 from "../Matrix4"
import Vector3 from "../Vector3"

test("Matrix4", assert => {
    let transform = Matrix4.transformation(
        new Vector3(10, 20, 5),
        new Vector3(2, 3, 2),
        new Vector3(1, 1, 1), Math.PI / 2
    )
    let a = new Vector3(1, 2, 3)
    let b = a.transform(transform)
    let inverse = transform.inverse()
    let c = b.transform(inverse)
    assert.false(a.equivalent(b))
    assert.true(a.equivalent(c))
})
