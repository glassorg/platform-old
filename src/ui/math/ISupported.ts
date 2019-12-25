import Vector3 from "./Vector3"
export default interface ISupported {
    // Returns the furthest point along a direction.
    support(v: Vector3): Vector3
}