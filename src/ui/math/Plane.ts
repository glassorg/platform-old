import Vector3 from "./Vector3"

/**
 * A Plane is represented by a normal vector
 * and a distance from the origin to the closest point on the plane.
 */
export default class Plane {

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

}