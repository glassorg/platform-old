import { SupportFunction } from "./gjkCommon";
import Vector3 from "../Vector3";
import gjkRaycast3 from "./gjkRaycast3";

export function shapeCast(supportA: SupportFunction, supportB: SupportFunction, velocityA: Vector3, velocityB: Vector3) {
    let minkowskiDiffSupport = (v: Vector3) => supportA(v).subtract(supportB(v.negate()))
    let relativeVelocity = velocityB.subtract(velocityA)
    return gjkRaycast3(minkowskiDiffSupport, relativeVelocity)
}