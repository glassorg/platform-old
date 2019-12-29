import Vector3 from "./Vector3"
import { equivalent } from "."
import Sphere from "./Sphere"
import AABB from "./AABB"

export default class Ray {

    readonly point: Vector3
    readonly unitHeading: Vector3

    constructor(point: Vector3, heading: Vector3) {
        this.point = point
        if (!equivalent(heading.lengthSquared(), 1))
            this.unitHeading = heading.normalize()
        else
            this.unitHeading = heading
    }

    getPosition(distance: number) {
        return this.point.add(this.unitHeading.scale(distance))
    }

    containsPoint(point: Vector3) {
        return equivalent(point.subtract(this.point).dot(this.unitHeading), 0)
    }

}