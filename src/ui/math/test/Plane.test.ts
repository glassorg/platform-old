import test from "ava"
import Vector3 from "../Vector3"
import Plane from "../Plane"
import Capsule from "../Capsule"
import Sphere from "../Sphere"
import Line from "../Line"

test("PlaneIntersection", assert => {
    let plane = new Plane(new Vector3(1, 1, 1), 0)
    assert.true(
        plane.intersects(
            new Sphere(
                new Vector3(1, 1, 1),
                Math.hypot(1, 1, 1) + 0.01
            )
        )
    )
    assert.false(
        plane.intersects(
            new Sphere(
                new Vector3(1, 1, 1),
                Math.hypot(1, 1, 1) - 0.01
            )
        )
    )
    let capsuleFunc = (epsilon) =>
        new Capsule(
            new Sphere(
                new Vector3(100, 100, 100),
                0.5
            ),
            new Sphere(
                new Vector3(2, 2, 2),
                Math.hypot(2, 2, 2) + epsilon
            )
        )
    assert.true(plane.intersects(capsuleFunc(0.01)))
    assert.false(plane.intersects(capsuleFunc(-0.01)))
})


test("PlaneClosestPoint", assert => {
    let plane = new Plane(new Vector3(1, 1, 1), 0)
    let line = new Line(
        new Vector3(-1, -1, -1),
        new Vector3(1, 1, 1),
    )
    assert.deepEqual(
        plane.getClosestPoint(
            new Line(
                new Vector3(-1, -1, -1),
                new Vector3(1, 1, 1),
            )
        ),
        Vector3.zero
    )
})