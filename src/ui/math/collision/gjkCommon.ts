import Vector3 from "../Vector3"
import Matrix4 from "../Matrix4"

export type SupportFunction = (v: Vector3) => Vector3

export function normalOnSide(vector: Vector3, direction: Vector3) {
    return vector.cross(direction).cross(vector)
}

export function faceNormalOnSide(a: Vector3, b: Vector3, c: Vector3, abovePoint: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let normal = ab.cross(ac)
    return normal.dot(abovePoint.subtract(a)) < 0 ?
        normal.negate() :
        normal
}

export function isOriginAbove(rayOrigin: Vector3, rayHeading: Vector3) {
    return rayOrigin.dot(rayHeading) < 0
}

export function checkEdge(a: Vector3, b: Vector3) {
    let heading = b.subtract(a)
    return isOriginAbove(a, heading)
}

export function checkTriangleEdge(a: Vector3, b: Vector3, inPoint: Vector3) {
    let heading = b.subtract(a)
    return isOriginAbove(a, heading) && !isOriginAbove(a, normalOnSide(heading, inPoint.subtract(a)))
}

export function normalForEdge(a: Vector3, b: Vector3) {
    return normalOnSide(b.subtract(a), a.negate())
}

export function checkFace(a: Vector3, b: Vector3, c: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let abNormal = normalOnSide(ab, ac)
    let acNormal = normalOnSide(ac, ab)
    return isOriginAbove(a, abNormal) && isOriginAbove(a, acNormal)
}

export function normalForFace(a: Vector3, b: Vector3, c: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let normal = ab.cross(ac)
    return normal.dot(a) > 0 ?
        normal.negate() :
        normal
}

export function checkTetrahedron(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
    return isOriginAbove(a, faceNormalOnSide(a, b, c, d)) &&
        isOriginAbove(a, faceNormalOnSide(a, b, d, c)) &&
        isOriginAbove(a, faceNormalOnSide(a, c, d, b))
}

export function checkTetrahedralVertex(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
    return !checkEdge(a, b) &&
        !checkEdge(a, c) &&
        !checkEdge(a, d)
}

export function checkTetrahedralEdge(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let ad = d.subtract(a)
    let acNormal = normalOnSide(ab, ac)
    let adNormal = normalOnSide(ab, ad)
    return checkEdge(a, b) &&
        !isOriginAbove(a, acNormal) &&
        !isOriginAbove(a, adNormal)
}

export function checkTetrahedralFace(a: Vector3, b: Vector3, c: Vector3, inPoint: Vector3) {
    return checkFace(a, b, c) && !isOriginAbove(a, faceNormalOnSide(a, b, c, inPoint))
}

export function nonMultiple(vector: Vector3) {
    let result = new Vector3(1, 0, 0)
    while (result.cross(vector).equivalent(Vector3.zero))
        result = new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize()
    return result
}

export function raycastTriangle(rayOrigin: Vector3, rayHeading: Vector3, a: Vector3, b: Vector3, c: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let ao = rayOrigin.subtract(a)
    let h = rayHeading
    let m = new Matrix4(
        ab.x, ab.y, ab.z, 0,
        ac.x, ac.y, ac.z, 0,
        -h.x, -h.y, -h.z, 0,
        0, 0, 0, 1)
    let hc = ao.transform(m.inverse()) // Barycentric coordinates of hit.
    let time = hc.z
    if (hc.x < 0 || hc.y < 0 || hc.x + hc.y > 1 || time < 0)
        return null
    return time
}
