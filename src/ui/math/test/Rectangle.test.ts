import test from "ava"
import Vector3 from "../Vector3"
import Plane from "../Plane"
import Capsule from "../Capsule"
import Sphere from "../Sphere"
import Line from "../Line"
import Rectangle from "../Rectangle"

test("Rectangle", assert => {

    let rect = new Rectangle(0, 0, 195, 195)
    let capsule = new Capsule(
        new Sphere(new Vector3(200, 200, 0), 10),
        new Sphere(new Vector3(200, 200, 1), 10)
    )

    let result = rect.intersectsCapsule(capsule)

    rect = new Rectangle(0, 0, 185, 185)
    result = rect.intersectsCapsule(capsule)
    assert.deepEqual(result, null)
})
