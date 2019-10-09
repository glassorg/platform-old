import Vector3 from "./Vector3"
import { equivalent } from "."
import Rectangle from "./Rectangle"

export default class Vector2 {

    x: number
    y: number

    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    *[Symbol.iterator]() {
        yield this.x
        yield this.y
    }

    add(v: Vector2) {
        return new Vector2(this.x + v.x, this.y + v.y)
    }

    subtract(v: Vector2) {
        return new Vector2(this.x - v.x, this.y - v.y)
    }

    multiply(v: Vector2) {
        return new Vector2(this.x * v.x, this.y * v.y)
    }

    scale(f: number) {
        return new Vector2(this.x * f, this.y * f)
    }

    negate() {
        return new Vector2(- this.x, - this.y)
    }

    dot(v: Vector2) {
        return this.x * v.x + this.y * v.y
    }

    cross(v: Vector2) {
        return new Vector3(0, 0, this.x * v.y - this.y * v.x)
    }

    lerp(v: Vector2, alpha: number) {
        return new Vector2(
            this.x + alpha * (v.x - this.x),
            this.y + alpha * (v.y - this.y)
        )
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y
    }

    length() {
        return Math.hypot(this.x, this.y)
    }

    normalize() {
        let invLength = 1 / this.length()
        return new Vector2(this.x * invLength, this.y * invLength);
    }

    equals(v: Vector2) {
        return this.x === v.x && this.y === v.y
    }

    equivalent(v: Vector2) {
        return equivalent(this.x, v.x)
            && equivalent(this.y, v.y)
    }

    static zero = Object.freeze(new Vector2(0, 0))

    static getBounds(points: Vector2[]) {
        if (points.length == 0) {
            return new Rectangle(0, 0, 0, 0)
        }
        let minX, maxX, minY, maxY;
        for (let {x, y} of points) {
            if (minX == null) {
                minX = maxX = x
                minY = maxY = y
            }
            else {
                minX = Math.min(minX, x)
                maxX = Math.max(maxX, x)
                minY = Math.min(minY, y)
                maxY = Math.max(maxY, y)
            }
        }
        return new Rectangle(minX, minY, maxX - minX, maxY - minY)
    }

    toArray() {
        return [ this.x, this.y ]
    }

    toFloat32Array() {
        return new Float32Array(this.toArray())
    }

    toString() {
        return `(${this.x},${this.y})`
    }

}