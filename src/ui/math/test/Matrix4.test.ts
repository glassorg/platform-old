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

test("Matrix4 / Vector Associativity", assert => {
    let x = new Vector3(1, 0, 0)
    let y = new Vector3(0, 1, 0)
    let z = new Vector3(0, 0, 1)
    let xPrime = x.transform(
        Matrix4.rotation(y, Math.PI / 2)
    ).transform(
        Matrix4.rotation(z, Math.PI / 2)
    ) // = Rz (Ry x)
    let xPrime2 = x.transform(
        Matrix4.rotation(z, Math.PI / 2)
            .multiply(Matrix4.rotation(y, Math.PI / 2))
    ) // = (Rz Ry) x
    let xPrime3 = x.transform(
        Matrix4.rotation(y, Math.PI / 2)
            .multiply(Matrix4.rotation(z, Math.PI / 2))
    ) // = (Ry Rz) x

    assert.true(xPrime.equivalent(xPrime2))
    assert.false(xPrime3.equivalent(xPrime2))
})