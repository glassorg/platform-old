import Vector3 from "./Vector3"

/**
 * Represents a line and/or a line segment.
 * The normalized position along the line corresponds to 
 * When representing a line segment then any positions between 'a' and 'b' inclusive
 * are consider on the line segment and can be represented with normalized values
 * between zero and one.
 */
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

    /**
     * Returns the alpha value (normalized position along the line)
     * that corresponds to the closest point on this line to the position.
     * @param position 
     */
    getAlpha(position: Vector3) {
        throw new Error("kpi")
    }

    toString() {
        return `${this.a} -> ${this.b}`
    }

}