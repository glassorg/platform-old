import Matrix4 from "./Matrix4"
import { equivalent } from "."
import Vector3 from "./Vector3"

export default class Vector4 {

    readonly x: number
    readonly y: number
    readonly z: number
    readonly w: number

    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x
        this.y = y
        this.z = z
        this.w = w
    }

    *[Symbol.iterator]() {
        yield this.x
        yield this.y
        yield this.z
        yield this.w
    }

    add(v: Vector4) {
        return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w)
    }

    subtract(v: Vector4) {
        return new Vector4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w)
    }

    multiply(v: Vector4) {
        return new Vector4(this.x * v.x, this.y * v.y, this.z * v.z, this.w * v.w)
    }

    scale(f: number) {
        return new Vector4(this.x * f, this.y * f, this.z * f, this.w * f)
    }

    negate() {
        return new Vector4(- this.x, - this.y, - this.z, - this.w)
    }

    equivalent(v: Vector4) {
        return equivalent(this.x, v.x)
            && equivalent(this.y, v.y)
            && equivalent(this.z, v.z)
            && equivalent(this.w, v.w)
    }

    lerp(v: Vector4, alpha: number) {
        return new Vector4(
            this.x + alpha * (v.x - this.x),
            this.y + alpha * (v.y - this.y),
            this.z + alpha * (v.z - this.z),
            this.w + alpha * (v.w - this.w)
        )
    }

    toVector3() {
        return new Vector3(this.x, this.y, this.z)
    }

    transform(m: Matrix4) {
        let { x, y, z, w } = this
        return new Vector4(
            m.m00 * x + m.m10 * y + m.m20 * z + m.m30 * w,
            m.m01 * x + m.m11 * y + m.m21 * z + m.m31 * w,
            m.m02 * x + m.m12 * y + m.m22 * z + m.m32 * w,
            m.m03 * x + m.m13 * y + m.m23 * z + m.m33 * w,
        )
    }

    static zero = new Vector4(0, 0, 0, 0)

    toArray() {
        return [ this.x, this.y, this.z, this.w ]
    }

    toFloat32Array() {
        return new Float32Array(this.toArray())
    }

    toString() {
        return `(${this.x},${this.y},${this.z},${this.w})`
    }

}