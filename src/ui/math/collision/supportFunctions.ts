import { SupportFunction } from "./gjkCommon"
import Vector3 from "../Vector3"
import Matrix4 from "../Matrix4"

export default {
    sum: (supports) => (v) => supports.map(s => s(v)).reduce((a, b) => a.add(b)),
    diff: (a: SupportFunction, b: SupportFunction) => (v: Vector3) => a(v).subtract(b(v.negate())),
    cube: (s, bias = 1) => (v) => new Vector3(Math.sign(v.x) || bias, Math.sign(v.y) || bias, Math.sign(v.z) || bias).scale(s),
    line: (s) => (v) => new Vector3(Math.sign(v.x), 0, 0).scale(s),
    capsule: (a: Vector3, b: Vector3, radius: number) => v => {
        v = v.normalize().scale(radius)
        let aSupport = a.add(v)
        let bSupport = b.add(v)
        return aSupport.dot(v) > bSupport.dot(v) ? aSupport : bSupport
    },
    sphere: (s) => (v) => v.normalize().scale(s),
    cone: (s) => (v) => {
        let a = new Vector3(0, s, 0)
        let invRadius = 1 / Math.hypot(v.x, v.z)
        let b = new Vector3(v.x * invRadius, -1, v.z * invRadius).scale(s)
        return a.dot(v) > b.dot(v) ? a : b
    },
    cylinder: (s) => (v) => {
        let invRadius = 1 / Math.hypot(v.x, v.z)
        return new Vector3(v.x * invRadius, Math.sign(v.y), v.z * invRadius).scale(s)
    },
    rotate: (axis: Vector3, angle: number, support: SupportFunction) => v => {
        let pre = v.transform(Matrix4.rotation(axis, -angle))
        let preSupport = support(pre)
        return preSupport.transform(Matrix4.rotation(axis, angle))
    },
    translate: (translation: Vector3, support: SupportFunction) => v => support(v).add(translation),
    polyhedron: vertices => v => vertices.reduce((a, b) => b.dot(v) > a.dot(v) ? b : a),
}