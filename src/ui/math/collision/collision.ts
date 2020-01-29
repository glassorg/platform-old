import { SupportFunction } from "./gjkCommon";
import Vector3 from "../Vector3";
import gjkRaycast3 from "./gjkRaycast3";
import { equivalent } from "..";

export function shapeCast(supportA: SupportFunction, supportB: SupportFunction, velocityA: Vector3, velocityB: Vector3) {
    let minkowskiDiffSupport = (v: Vector3) => supportA(v).subtract(supportB(v.negate()))
    let relativeVelocity = velocityB.subtract(velocityA)
    return gjkRaycast3(minkowskiDiffSupport, relativeVelocity)
}

const ex = new Vector3(1, 0, 0)
const ey = new Vector3(0, 1, 0)
export function supportFace(support: SupportFunction, normal: Vector3, samples = 16, deltaNormal = 0.001) {
    let vertices: Vector3[] = []
    normal = normal.normalize()
    let up = normal.cross(ey).equivalent(Vector3.zero) ? ex : ey
    let finger = normal.cross(up).normalize()
    let thumb = finger.cross(normal).normalize()
    for (let i = 0; i < samples; i++) {
        let angle = Math.PI * 2 * i / samples
        let u = Math.sin(angle) * deltaNormal
        let v = Math.cos(angle) * deltaNormal
        let vertex = support(
            normal
                .add(finger.scale(u))
                .add(thumb.scale(v))
        )

        // let collinear = false
        let vs = vertices
        let vc = vs.length
        // if (vc > 1)
        //     collinear = vertex.subtract(vs[vc - 1])
        //         .cross(vs[vc - 1].subtract(vs[vc - 2]))
        //         .equivalent(Vector3.zero)

        // if (collinear)
        //     vs[vc - 1] = vertex
        if (i == 0 || !vertex.equivalent(vs[vc - 1]))
            vs.push(vertex)
    }
    return vertices
}

export function supportContactManifold(supportA: SupportFunction, supportB: SupportFunction, normal: Vector3) {
}