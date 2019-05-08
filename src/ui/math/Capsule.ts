import Line from "./Line";
import Sphere from "./Sphere";
import Matrix4 from "./Matrix4";
import Vector3 from "./Vector3";

/**
 * Represents a swept sphere with potentially different radius at the starting and ending points.
 */
export default class Capsule {

    readonly a: Sphere
    readonly b: Sphere

    constructor(a: Sphere, b: Sphere) {
        this.a = a
        this.b = b
    }

    get line() {
        return new Line(this.a.center, this.b.center)
    }

    /**
     * Gets the radius at a normalized position along the capsule.
     * @param alpha 
     */
    getRadius(alpha = 0.5) {
        return this.a.center.lerp(this.b.center, alpha)
    }

    translate(v: Vector3) {
        return new Capsule(
            this.a.translate(v),
            this.b.translate(v)
        )
    }

    transform(m: Matrix4) {
        return new Capsule(
            this.a.transform(m),
            this.b.transform(m)
        )
    }

}