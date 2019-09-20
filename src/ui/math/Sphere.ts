import Vector3 from "./Vector3"
import Vector4 from "./Vector4"
import Matrix4 from "./Matrix4"

export default class Sphere {

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

}