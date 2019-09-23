import KeyFrame from "./KeyFrame"

// type Interpolate<T> = (a: T, b: T, alpha: number) => T 

// function NumberInterpolate(a: number, b: number, alpha: number) {
//     return a + (b - a) * alpha
// }

//  catmull

//  0 -> value, duration

// also need convenient typed constructor with only numbers...
export class KeyFrameAnimation<T> {

    type: any
    frames: KeyFrame<T>[]

    constructor(...frames: KeyFrame<T>[]) {
        this.type = (frames[0].value as any).constructor
        this.frames = frames
    }

    private getFrameIndex(time: number) {
        for (let index = 0; index < this.frames.length; index++) {
            if (this.frames[index].time > time) {
                return index
            }
        }
        return this.frames.length
    }

    private getFrames(time: number): KeyFrame<T>[] {
        let frames: KeyFrame<T>[] = []
        let index = this.getFrameIndex(time)

        return frames
    }

    getValue(time: number) {
    }

}

function getIndexOfP1(controlPoints: number[], x: number) {
    for (let i = 0; i < controlPoints.length; i += 2) {
        let px = controlPoints[i]
        if (x < px) {
            return i - 2
        }
    }
    return controlPoints.length
}

/**
 * Points contains successive keyframes each consisting of a time, value pair
 * @param points [t0, v0, t1, v1...]
 */
export function createKeyFrameFunction(...points: number[]) {
    return function(time: number) {
        if (time <= points[0]) {
            return points[1]
        }
        if (time >= points[points.length - 2]) {
            return points[points.length - 1]
        }
        //  at this point we know we can get a valid index
        //  that contains values for p1 and p2
        //  p0 and p3 might not exist though
        let ip1 = getIndexOfP1(points, time)
        //  get the values and time points
        let t1 = points[ip1+0]
        let p1 = points[ip1+1]
        let t2 = points[ip1+2]
        let p2 = points[ip1+3]
        let t0 = ip1 > 0 ? points[ip1-2] : t1 - (t2 - t1)
        let p0 = ip1 > 0 ? points[ip1-1] : p1
        let t3 = ip1 + 4 < points.length ? points[ip1+4] : t2 + (t2 - t1)
        let p3 = ip1 + 4 < points.length ? points[ip1+5] : p2

        let duration = t2 - t1
        // we multiply by duration because we're normalizing the time range to 0-1 so we have to scale up the slope
        let m0 = (p2 - p0) / (t2 - t0) * duration
        let m1 = (p3 - p1) / (t3 - t1) * duration
        let t = (time - t1) / duration
        let tt = t * t
        let ttt = tt * t

        let pt = (2 * ttt - 3 * tt + 1) * p1 + (ttt - 2 * tt + t) * m0 + (-2 * ttt + 3 * tt) * p2 + (ttt - tt) * m1

        return pt
    }
}