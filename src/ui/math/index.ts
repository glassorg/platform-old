import Color from "./Color"
import Vector4 from "./Vector4"
import Vector2 from "./Vector2"
import Vector3 from "./Vector3"

export const epsilon = 0.000001

export function equivalent(a: number, b: number) {
    return Math.abs(a - b) <= epsilon * Math.max(1, Math.abs(a), Math.abs(b))
}

export function clamp(value: number, min: number = 0, max: number = 1) {
    return value < min ? min : value > max ? max : value
}

export function lerp(a, b, alpha = 0.5) {
    if (typeof a === "number") {
        return a * (1 - alpha) + b * alpha
    }
    return a.lerp(b, alpha)
}

export type RandomNumberGenerator = (min?, max?) => number

// Source: https://en.wikipedia.org/wiki/Xorshift
export function randomNumberGenerator(seed = Number.MAX_SAFE_INTEGER): RandomNumberGenerator {
    let x = seed
    let coef = 1 / (1 << 31)
    return function random(min = 0, max = 1) {
        x ^= x << 13
        x ^= x >> 7
        x ^= x << 17
        let r = Math.abs(x * coef)
        return min + r * (max - min)
    }
}