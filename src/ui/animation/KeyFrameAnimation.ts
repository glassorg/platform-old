import KeyFrame from "./KeyFrame"
import Operations, { getOperations } from "./Operations"

// also need convenient typed constructor with only numbers...
export class KeyFrameAnimation<T> {

    operations: Operations<T>
    frames: KeyFrame<T>[]

    constructor(...frames: KeyFrame<T>[]) {
        let type = (frames[0].value as any).constructor
        this.operations = getOperations(type)
        this.frames = frames
    }

    private getIndexOfP1(time: number) {
        for (let index = 0; index < this.frames.length; index++) {
            if (time < this.frames[index].time) {
                return index - 1
            }
        }
        return this.frames.length
    }

    getValue(time: number) {
        //  we use the catmull rom method for Smooth animations.
        let { frames } = this
        if (time <= frames[0].time) {
            return frames[0].value
        }
        if (time >= frames[frames.length - 1].time) {
            return frames[frames.length - 1].value
        }
        //  at this point we know we can get a valid index
        //  that contains values for p1 and p2
        //  p0 and p3 might not exist though
        let ip1 = this.getIndexOfP1(time)
        //  get the values and time points
        let frame = frames[ip1]
        let p1 = frame.value
        if (frame.interpolation === "none") {
            return p1
        }
        let t1 = frame.time
        let p2 = frames[ip1+1].value
        let t2 = frames[ip1+1].time
        let duration = t2 - t1
        let t = (time - t1) / duration
        if (frame.interpolation === "linear") {
            return this.operations.add(
                this.operations.scale(p1, 1 - t),
                this.operations.scale(p2, t)
            )
        }

        //  else smooth catmull rom spline interpolation
        let p0 = ip1 > 0 ? frames[ip1-1].value : p1
        let t0 = ip1 > 0 ? frames[ip1-1].time : t1 - (t2 - t1)
        let p3 = ip1 + 2 < frames.length ? frames[ip1+2].value : p2
        let t3 = ip1 + 2 < frames.length ? frames[ip1+2].time : t2 + (t2 - t1)

        // we multiply by duration because we're normalizing the time range to 0-1 so we have to scale up the slope
        let m0 = this.operations.scale(this.operations.subtract(p2, p0), duration / (t2 - t0))
        let m1 = this.operations.scale(this.operations.subtract(p3, p1), duration / (t3 - t1))
        let tt = t * t
        let ttt = tt * t

        let pt =
            this.operations.add(
                this.operations.scale(p1, 2 * ttt - 3 * tt + 1),
                this.operations.scale(m0, ttt - 2 * tt + t),
                this.operations.scale(p2, -2 * ttt + 3 * tt),
                this.operations.scale(m1, ttt - tt)
            )

        return pt
    }

}
