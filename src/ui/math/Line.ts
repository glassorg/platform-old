import Vector3 from "./Vector3"

export default class Line {

    a: Vector3
    b: Vector3

    constructor(a: Vector3, b: Vector3) {
        this.a = a
        this.b = b
    }

    /**
     * Returns the position between a and b where 0 = a and 1 = b.
     * @param alpha value normally between 0 and 1
     */
    getPosition(alpha: number) {
        return this.a.lerp(this.b, alpha)
    }

    toString() {
        return `${this.a} -> ${this.b}`
    }

}