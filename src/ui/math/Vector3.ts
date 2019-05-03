
export default class Vector3 {

    x: number
    y: number
    z: number

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

    static zero = Object.freeze(new Vector3(0, 0, 0))

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