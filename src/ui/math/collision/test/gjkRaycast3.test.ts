import test from "ava"
import gjkRaycast3 from "../gjkRaycast3"
import Vector3 from "../../Vector3"

test("GJK Raycast 3", assert => {
    let gr = gjkRaycast3
    let support = (v: Vector3) => v.normalize().scale(10).add(new Vector3(10, 0, 0))
    let debug = {}
    let collided = gr(support, new Vector3(1, 0, 0), debug)
    console.log(collided)
    console.log(debug)
})