import Size from "./Size"
import Vector2 from "./Vector2"
import Vector3 from "./Vector3"
import Vector4 from "./Vector4"
import Spacing from "./Spacing"
import BoundingShape from "./BoundingShape"
import Line from "./Line"
import Capsule from "./Capsule"
import Plane from "./Plane"
import { clamp, epsilon } from "."

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

    intersectsCapsule(capsule: Capsule): Vector3 | null {
        //  TODO: Fix this shit
        let line = capsule.line()
        let pointInRect = this.getClosestPoint(line)
        let alpha = line.getAlpha(pointInRect)
        let radius = capsule.getRadius(alpha)
        let pointInLine = line.getPosition(alpha)
        return pointInRect.subtract(pointInLine).length() <= (radius + epsilon) ? pointInRect : null
        // let dx = Math.min(Math.abs(pointInRect.x - this.left), Math.abs(pointInRect.x - this.right))
        // let dy = Math.min(Math.abs(pointInRect.y - this.top), Math.abs(pointInRect.y - this.bottom))
        // return (radius * radius) <= (dx * dx + dy * dy) ? pointInRect : null
    }

    intersectsLine(line: Line): boolean {
        let point = this.getPlane().getClosestPoint(line)
        return this.contains(point)
    }

    /**
     * Returns the closest point to the line which lies within this bounding shape.
     * If multiple points intersect the line the point closest to 'a' is preferred.
     */
    getClosestPoint(line: Line): Vector3 {
        let point = this.getPlane().getClosestPoint(line)
        if (this.contains(point)) {
            return point
        }
        let x = clamp(point.x, this.left, this.right)
        let y = clamp(point.y, this.top, this.bottom)
        return new Vector3(x, y, 0)
    }

    /**
     * Returns the plane this Rectangle lies on.
     * The plane intersects the origin and the normal is in the positive z direction.
     */
    getPlane() {
        return new Plane(new Vector3(0, 0, 1), 0)
    }

}
