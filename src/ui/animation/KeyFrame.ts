
export default class KeyFrame<T> {

    time: number
    value: T
    interpolation: "smooth" | "linear" | "none"

    constructor(time: number, value: T, interpolation: "smooth" | "linear" | "none" = "smooth") {
        this.time = time
        this.value = value
        this.interpolation = interpolation
    }

}