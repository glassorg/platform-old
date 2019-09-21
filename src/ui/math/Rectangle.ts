import Size from "./Size"
import Vector2 from "./Vector2"
import Vector3 from "./Vector3"
import Vector4 from "./Vector4"
import Spacing from "./Spacing"

export default class Rectangle implements Size {

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

}
