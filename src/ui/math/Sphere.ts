import Vector3 from "./Vector3";

export default class Sphere {

    readonly center: Vector3
    readonly radius: number

    constructor(center: Vector3 = Vector3.zero, radius = 1) {
        this.center = center
        this.radius = radius
    }

}