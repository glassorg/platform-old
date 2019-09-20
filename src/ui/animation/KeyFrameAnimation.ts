import KeyFrame from "./KeyFrame"

// type Interpolate<T> = (a: T, b: T, alpha: number) => T 

// function NumberInterpolate(a: number, b: number, alpha: number) {
//     return a + (b - a) * alpha
// }

// also need convenient typed constructor with only numbers...
export class KeyFrameAnimation<T = number> {

    type: any
    frames: KeyFrame<T>[]

    constructor(frames: KeyFrame<T>[]) {
        this.type = (frames[0]!.value as any).constructor
        this.frames = frames
        // this.lerp = (frames[0].value as any).constructor.lerp || NumberInterpolate
    }

}