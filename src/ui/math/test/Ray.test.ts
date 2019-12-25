import test from "ava"
import Ray from "../Ray"
import Vector3 from "../Vector3"
import Sphere from "../Sphere"
import { equivalent } from ".."
import AABB from "../AABB"

test("Cast on Sphere", assert => {
    let r = new Ray(new Vector3(0, Math.sin(Math.PI / 4), 0), new Vector3(1, 0, 0))
    let s = new Sphere(new Vector3(1, 0, 0), 1)
    let d = s.raycastDistance(r)
    if (d === null)
        return assert.fail()
    assert.true(
        equivalent(
            (1 - d),
            Math.sqrt(2) / 2
        )
    )
})

test("Cast on AABB", assert => {
    let r = new Ray(new Vector3(0, 0, 0), new Vector3(0, 1, 0))
    let box = new AABB(new Vector3(0, 10, 0), new Vector3(1, 1, 1))
    let hit = box.raycast(r)
    if (hit === null)
        return assert.fail()
    let normal = box.normal(hit)
    assert.deepEqual(
        { hit, normal },
        {
            hit: new Vector3(0, 9, 0),
            normal: new Vector3(0, -1, 0)
        }
    )
})
