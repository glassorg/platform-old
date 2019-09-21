import Size from "./Size"
import Vector2 from "./Vector2"
import Vector3 from "./Vector3"
import Vector4 from "./Vector4"
import Spacing from "./Spacing"
import BoundingShape from "./BoundingShape"
import Line from "./Line"
import Capsule from "./Capsule"

export default class Rectangle implements Size, BoundingShape {

    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    get top() { return this.y }
    get left() { return this.x }
    get bottom() { return this.y + this.height }
    get right() { return this.x + this.width }

    contains(point: Vector2 | Vector3 | Vector4) {
        return point.x >= this.left && point.x <= this.right
            && point.y >= this.top && point.y <= this.bottom
    }

    add(b: Spacing) {
        if (!b || b.isZero) {
            return this
        }
        return new Rectangle(this.x - b.left, this.y - b.top, this.width + b.left + b.right, this.height + b.top + b.bottom)
    }

    subtract(b: Spacing) {
        if (!b || b.isZero) {
            return this
        }
        return new Rectangle(this.x + b.left, this.y + b.top, this.width - b.left - b.right, this.height - b.top - b.bottom)
    }

    intersects(capsule: Capsule) {
        return false
    }
    /**
     * Returns the closest point to the line which lies within this bounding shape.
     * If multiple points intersect the line the point closest to 'a' is preferred.
     */
    getClosestPoint(line: Line) {
        return Vector3.zero
    }
}
