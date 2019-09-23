import Vector3 from "./Vector3"
import Vector4 from "./Vector4"
import Matrix4 from "./Matrix4"
import ISupported from "./ISupported"

export default class Sphere implements ISupported {

    readonly center: Vector3
    readonly radius: number

    constructor(center: Vector3 = Vector3.zero, radius = 1) {
        this.center = center
        this.radius = radius
    }

    translate(v: Vector3) {
        return new Sphere(
            this.center.translate(v),
            this.radius
        )
    }

    transform(m: Matrix4) {
        // to transform the radius we will transform two points radius distance apart and then use their new distance
        return new Sphere(
            this.center.transform(m),
            Vector3.zero.transform(m).subtract(new Vector3(this.radius)).length()
        )
    }

    // Returns the furthest point along a direction.
    support(v: Vector3) {
        return v.normalize().scale(this.radius).add(this.center)
    }

    addRadius(value: number) {
        return value === 0 ? this : new Sphere(this.center, this.radius + value)
    }

}