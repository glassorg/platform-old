import Capsule from "../../math/Capsule";

type Filter = (shape: any) => boolean

export default class PickRequest {

    shape: Capsule
    maximum: number
    filter: Filter | null

    constructor(shape: Capsule, maximum: number = 1, filter: Filter | null = null) {
        this.shape = shape
        this.maximum = maximum
        this.filter = filter
    }

}