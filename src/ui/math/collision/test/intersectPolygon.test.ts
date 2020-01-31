import test from "ava"
import Vector3 from "../../Vector3"
import intersectPolygon from "../intersectPolygon"

test("Intersect polygon", assert => {
    let polyA = [
        new Vector3(0, 0, 0),
        new Vector3(0, 1, 0),
        new Vector3(1, 1, 0),
        new Vector3(1, 0, 0),
    ]

    let polyB = [
        new Vector3(0.5, 0.5, 0),
        new Vector3(0.5, 1.5, 0),
        new Vector3(1.5, 1.5, 0),
        new Vector3(1.5, 0.5, 0),
    ]

    let intersection = intersectPolygon(polyA, polyB)
    console.log(intersection)

    assert.pass()
})