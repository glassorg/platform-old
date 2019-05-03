import { clamp } from ".";
import Vector3 from "./Vector3";

export default class Color implements Iterable<number> {

    red: number
    green: number
    blue: number
    alpha: number

    constructor(red: number, green: number, blue: number, alpha: number = 1.0) {
        this.red = red
        this.green = green
        this.blue = blue
        this.alpha = alpha
    }

    *[Symbol.iterator]() {
        yield this.red
        yield this.green
        yield this.blue
        yield this.alpha
    }

    get isVisible() {
        return this.alpha > 0
    }

    get isTransparent() {
        return this.alpha === 0
    }

    get isTranslucent() {
        return this.alpha > 0 && this.alpha < 1
    }

    get isOpaque() {
        return this.alpha > 1
    }

    toString() {
        return `rgba(${this.red * 255},${this.green * 255},${this.blue * 255},${this.alpha})`
    }

    scale(f: number) {
        return new Color(this.red * f, this.green * f, this.blue * f, this.alpha)
    }

    opacity(alpha: number) {
        return new Color(this.red, this.green, this.blue, alpha)
    }

    /**
     * Converts to a 32 bit integer in ABGR format which seems
     * to be what WebGL expects.
     */
    toInt32() {
        //  we are using * 2 ** bits
        //  instead of << bits
        //  since shifts are treated as with signed 32 bit integers
        //  which makes the most significant bit be negative
        //  also using + instead of | for the same reason
        return (Math.round(clamp(this.alpha) * 255) * 2 ** 24) +
            (Math.round(clamp(this.blue) * 255) * 2 ** 16) +
            (Math.round(clamp(this.green) * 255) * 2 ** 8) +
            Math.round(clamp(this.red) * 255)
    }

    static readonly red = ReadonlyColor(1, 0, 0)
    static readonly green = ReadonlyColor(0, 1, 0)
    static readonly blue = ReadonlyColor(0, 0, 1)
    static readonly white = ReadonlyColor(1, 1, 1)
    static readonly black = ReadonlyColor(0, 0, 0)
    static readonly transparent = ReadonlyColor(0, 0, 0, 0)

}

function ReadonlyColor(r: number, g: number, b: number, a: number = 1): Color {
    return Object.freeze(new Color(r, g, b, a)) as Color
}