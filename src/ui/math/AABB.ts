import Vector3 from "./Vector3";
import Ray from "./Ray";

export default class AABB {

    readonly center: Vector3
    readonly dimensions: Vector3

    constructor(center: Vector3, dimensions: Vector3) {
        this.center = center
        this.dimensions = dimensions
    }

    normal(point: Vector3) {
        let dx = (point.x - this.center.x) / this.dimensions.x
        let dy = (point.y - this.center.y) / this.dimensions.y
        let dz = (point.z - this.center.z) / this.dimensions.z
        let max = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz))
        let keepSignIfMax = (v) => Math.abs(v) >= max ? Math.sign(v) : 0
        return new Vector3(
            keepSignIfMax(dx),
            keepSignIfMax(dy),
            keepSignIfMax(dz)
        )
    }

    raycastDistance(ray: Ray, front: boolean = true) {
        let b = this.center
        let d = this.dimensions
        let p = ray.point
        let h = ray.unitHeading

        // Overlap times for projection on each axis.
        let tx0 = (b.x - p.x - d.x) / h.x
        let ty0 = (b.y - p.y - d.y) / h.y
        let tz0 = (b.z - p.z - d.z) / h.z

        let tx1 = (b.x - p.x + d.x) / h.x
        let ty1 = (b.y - p.y + d.y) / h.y
        let tz1 = (b.z - p.z + d.z) / h.z

        // Overlaps in 3D when every axis is overlapped.
        let maxDistance = Math.min(
            Math.max(tx0, tx1),
            Math.max(ty0, ty1),
            Math.max(tz0, tz1)
        )

        let minDistance = Math.max(
            Math.min(tx0, tx1),
            Math.min(ty0, ty1),
            Math.min(tz0, tz1)
        )

        if (maxDistance <= minDistance)
            return null

        return front ? minDistance : maxDistance
    }

    raycast(ray: Ray, front: boolean = true) {
        let distance = this.raycastDistance(ray, front)
        if (distance == null)
            return null
        return ray.getPosition(distance)
    }

}