import Vector3 from "./Vector3"
import BoundingShape from "./BoundingShape"
import Capsule from "./Capsule"
import Line from "./Line"

/**
 * A Plane is represented by a normal vector
 * and a distance from the origin to the closest point on the plane.
 */
export default class Plane implements BoundingShape {

    normal: Vector3
    distance: number

    constructor(normal: Vector3, distance: number) {
        this.normal = normal
        this.distance = distance
    }

    getClosestPointToOrigin() {
        return new Vector3(
            this.normal.x * this.distance,
            this.normal.y * this.distance,
            this.normal.z * this.distance,
        )
    }

    intersectsCapsule(capsule: Capsule): boolean {
        throw new Error("kpi")
    }

    getClosestPoint(line: Line): Vector3 {
        throw new Error("kpi")
    }

}