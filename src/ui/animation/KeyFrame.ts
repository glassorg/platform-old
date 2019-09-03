
export default class KeyFrame<T = number> {

    time: number
    value: T

    constructor(time: number, value: T) {
        this.time = time
        this.value = value
    }

}
