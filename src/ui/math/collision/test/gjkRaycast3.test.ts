import test from "ava"
import gjkRaycast3 from "../gjkRaycast3"
import Vector3 from "../../Vector3"
import Vector2 from "../../Vector2"

test("GJK Raycast 3", assert => {
    let t = -1
    function random(a, b) {
        let octaves = 10
        let rand = 0
        let R = Math.PI ** 2
        for (let i = 0; i < octaves; i++) {
            rand += Math.cos(t * R * i + t)
            t = rand
        }
        rand = 1 / (1 + Math.exp(-rand * 0.9))
        return rand * (b - a) + a
    }

    function randomCheck() {
        let r = 10
        let center = new Vector3(10, random(-r, r), random(-r, r))
        let support = (v: Vector3) => v.normalize().scale(r).add(center)
        let collision = gjkRaycast3(support, new Vector3(1, 0, 0))
        let collided = collision !== null
        let shouldCollide = Math.hypot(center.y, center.z) <= r
        return collided == shouldCollide
    }

    for (let i = 0; i < 100; i++)
        assert.assert(randomCheck())
})