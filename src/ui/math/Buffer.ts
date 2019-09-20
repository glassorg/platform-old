
export default class Buffer {

    left: number
    top: number
    right: number
    bottom: number

    constructor(left: number, top: number = left, right: number = left, bottom: number = top) {
        this.left = left
        this.top = top
        this.right = right
        this.bottom = bottom
    }

    negate() {
        return new Buffer(-this.left, -this.top, -this.right, -this.bottom)
    }

    add(b: Buffer) {
        return new Buffer(this.left + b.left, this.top + b.top, this.right + b.right, this.bottom + b.bottom)
    }

    subtract(b: Buffer) {
        return new Buffer(this.left - b.left, this.top - b.top, this.right - b.right, this.bottom - b.bottom)
    }

}