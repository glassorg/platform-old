import Matrix4 from "./Matrix4";
import { equivalent } from ".";

export default class Vector3 {

    readonly x: number
    readonly y: number
    readonly z: number

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x
        this.y = y
        this.z = z
    }

    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
        yield this.z;
    }

    add(v: Vector3) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z)
    }

    subtract(v: Vector3) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z)
    }

    multiply(v: Vector3) {
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z)
    }

    scale(f: number) {
        return new Vector3(this.x * f, this.y * f, this.z * f)
    }

    negate() {
        return new Vector3(- this.x, - this.y, - this.z)
    }

    dot(v: Vector3) {
        return this.x * v.x + this.y * v.y + this.z * v.z
    }

    cross(v: Vector3) {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        )
    }

    equivalent(v: Vector3) {
        return equivalent(this.x, v.x)
            && equivalent(this.y, v.y)
            && equivalent(this.z, v.z)
    }

    lerp(v: Vector3, alpha: number) {
        return new Vector3(
            this.x + alpha * (v.x - this.x),
            this.y + alpha * (v.y - this.y),
            this.z + alpha * (v.z - this.z)
        )
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }

    length() {
        return Math.hypot(this.x, this.y, this.z)
    }

    normalize() {
        let invLength = 1 / this.length()
        return new Vector3(this.x * invLength, this.y * invLength, this.z * invLength);
    }

    translate(v: Vector3) {
        return this.add(v)
    }

    transform(m: Matrix4) {
        let { x, y, z } = this
        let w = m.m03 * x + m.m13 * y + m.m23 * z + m.m33;
        w = w || 1.0;
        return new Vector3(
            (m.m00 * x + m.m10 * y + m.m20 * z + m.m30) / w,
            (m.m01 * x + m.m11 * y + m.m21 * z + m.m31) / w,
            (m.m02 * x + m.m12 * y + m.m22 * z + m.m32) / w,
        )
    }

    static zero = new Vector3(0, 0, 0)

    toArray() {
        return [ this.x, this.y, this.z ]
    }

    toFloat32Array() {
        return new Float32Array(this.toArray())
    }

    toString() {
        return `(${this.x},${this.y},${this.z})`
    }

}