import Vector3 from "../Vector3";
import Matrix4 from "../Matrix4";

export type SupportFunction = (v: Vector3) => Vector3

function raycastTriangle(rayOrigin: Vector3, rayHeading: Vector3, a: Vector3, b: Vector3, c: Vector3) {
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

function normalOnSide(vector: Vector3, direction: Vector3) {
    return vector.cross(direction).cross(vector)
}

function isOriginAbove(rayOrigin: Vector3, rayHeading: Vector3) {
    return rayOrigin.dot(rayHeading) < 0
}

function checkEdge(a: Vector3, b: Vector3) {
    let heading = b.subtract(a)
    return isOriginAbove(a, heading)
}

function checkTriangleEdge(a: Vector3, b: Vector3, inPoint: Vector3) {
    let heading = b.subtract(a)
    return isOriginAbove(a, heading) && !isOriginAbove(a, normalOnSide(heading, inPoint.subtract(a)))
}

function normalForEdge(a: Vector3, b: Vector3) {
    return normalOnSide(b.subtract(a), a.negate())
}

function checkFace(a: Vector3, b: Vector3, c: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let abNormal = normalOnSide(ab, ac)
    let acNormal = normalOnSide(ac, ab)
    return isOriginAbove(a, abNormal) && isOriginAbove(a, acNormal)
}

function normalForFace(a: Vector3, b: Vector3, c: Vector3) {
    let ab = b.subtract(a)
    let ac = c.subtract(a)
    let normal = ab.cross(ac)
    return normal.dot(a) > 0 ?
        normal.negate() :
        normal
}

function nonMultiple(vector: Vector3) {
    let result = new Vector3(1, 0, 0)
    while (result.cross(vector).equivalent(Vector3.zero))
        result = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
    return result
}

export default function gjkRaycast3(support: SupportFunction, heading: Vector3, debug: any = undefined) {
    const maxIterations = 100
    const initialHeading = nonMultiple(heading).cross(heading)
    let initialPoint = support(initialHeading)
    let searchDirection = heading.rejection(initialPoint.negate())
    let simplex: Vector3[] = [initialPoint]

    if (debug)
        debug.simplices = []

    function checkAndUpdateSimplex() {
        if (debug)
            debug.simplices.push(simplex.slice())

        switch (simplex.length) {

            case 1: {
                searchDirection = simplex[0].negate()
                return false
            }

            case 2: {
                let [b, a] = simplex
                if (checkEdge(a, b)) {
                    searchDirection = normalForEdge(a, b)
                } else {
                    searchDirection = a.negate()
                    simplex = [a]
                }
                return false
            }

            case 3: {
                let [c, b, a] = simplex
                if (checkFace(a, b, c)) {
                    return true
                } else if (checkTriangleEdge(a, b, c)) {
                    searchDirection = normalForEdge(a, b)
                    simplex = [b, a]
                } else if (checkTriangleEdge(a, c, b)) {
                    searchDirection = normalForEdge(a, c)
                    simplex = [c, a]
                } else {
                    searchDirection = a.negate()
                    simplex = [a]
                }
                return false
            }
        }
    }

    let i = 0
    while (true) {
        if (++i > maxIterations)
            return false
        searchDirection = heading.rejection(searchDirection)
        if (searchDirection.equivalent(Vector3.zero))
            searchDirection = searchDirection.add(new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5))

        let nextVertex = support(searchDirection)

        // let isVNaN = nextVertex.toArray().map(x => isNaN(x)).reduce((a, b) => a || b)
        // if (isVNaN)
        //     debugger

        if (nextVertex.dot(searchDirection) < 0)
            return false
        simplex.push(nextVertex)
        let intersected = checkAndUpdateSimplex()
        if (intersected)
            return true
    }
}